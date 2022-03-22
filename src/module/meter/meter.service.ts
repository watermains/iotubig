import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import * as Mongoose from 'mongoose';
import { from, lastValueFrom, map, tap } from 'rxjs';
import { RoleTypes } from 'src/decorators/roles.decorator';
import { IotService } from 'src/iot/iot.service';
import { ConfigurationRepository } from '../configuration/configuration.repository';
import { Action, LogService } from '../log/log.service';
import { OrganizationService } from '../organization/organization.service';
import { ScreenerService } from '../screener/screener.service';
import { TransactionRepository } from '../transaction/transaction.repository';
import { UserRepository } from '../user/user.repository';
import { CreateMeterIOTDto } from './dto/create-meter-iot.dto';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterValveDto } from './dto/update-meter-valve.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { ConsumerType } from './enum/consumer-type.enum';
import { MeterStatus } from './enum/meter.status.enum';
import { MeterRepository } from './meter.repository';

@Injectable()
export class MeterService {
  constructor(
    private readonly configRepo: ConfigurationRepository,
    private readonly userRepo: UserRepository,
    private readonly screenerService: ScreenerService,
    private readonly repo: MeterRepository,
    private readonly transactionRepo: TransactionRepository,
    private readonly iotService: IotService,
    private readonly logService: LogService,
    private readonly orgService: OrganizationService,
  ) {}

  async create(dto: CreateMeterDto, role: RoleTypes, user_org_id: string) {
    if (role == RoleTypes.admin) {
      dto.iot_organization_id = user_org_id;
    }

    await this.repo.createMeter(dto);
    return { message: 'Meter created successfully' };
  }

  async createIoT(organization_id: string, dto: CreateMeterIOTDto) {
    const config = await this.configRepo.findOne(organization_id);
    const oldMeter = await this.repo.findByDevEui(dto.dev_eui);
    const meter = await this.repo.upsertMeterViaIoT(dto);

    const users = await this.userRepo.isOwned(meter.meter_name);

    const rate = config.getConsumptionRate(meter.consumer_type);
    const perRate = meter.getWaterMeterRate(rate);
    this.screenerService.checkMeters(
      config,
      {
        perRate,
        batteryLevel: meter.battery_level,
        siteName: meter.site_name,
        meterName: meter.meter_name,
        allowedFlow: meter.allowed_flow,
        status: {
          isChanged: meter.valve_status !== oldMeter.valve_status,
          current: meter.valve_status,
        },
      },
      users,
    );
    return meter;
  }

  async findOrgMeters(organization_id: string, filter?: object) {
    return this.repo.findMetersWhere({
      iot_organization_id: new Mongoose.Types.ObjectId(organization_id),
      ...filter,
    });
  }

  async findAll(
    organization_id: string,
    offset: number,
    pageSize: number,
    valve_status?: MeterStatus,
    consumer_type?: ConsumerType,
    search?: string,
    role?: RoleTypes,
    iot_organization_id?: string,
    transactable?: boolean,
  ) {
    const configuration = await this.configRepo.findOne(organization_id);

    const low_balance_threshold = configuration?.water_alarm_threshold;
    const battery_level_threshold = configuration?.battery_level_threshold;

    const $match: {
      deleted_at: null;
      valve_status?: MeterStatus;
      consumer_type?: ConsumerType;
      $or?: unknown[];
      iot_organization_id?: Mongoose.Types.ObjectId;
      wireless_device_id?: { $nin: unknown[] };
    } = {
      deleted_at: null,
    };

    if (valve_status) {
      $match.valve_status = Number(valve_status);
    }

    if (consumer_type) {
      $match.consumer_type = consumer_type;
    }

    if (Boolean(transactable)) {
      $match.wireless_device_id = { $nin: [null, ''] };
    }

    if (search) {
      const fields = [
        'meter_name',
        'site_name',
        'unit_name',
        'dev_eui',
        ...(role == RoleTypes.superAdmin ? ['org.name'] : []),
      ];

      $match.$or = fields.map((field) => ({
        [field]: new RegExp(search, 'i'),
      }));
    }

    if (role == RoleTypes.admin && iot_organization_id) {
      $match.iot_organization_id = new Mongoose.Types.ObjectId(
        iot_organization_id,
      );
    }

    const { data, total_rows } = await this.repo.findAll(
      $match,
      offset,
      pageSize,
    );

    return {
      response: {
        meters: data.map((meter) => {
          const consumption_rate = configuration?.getConsumptionRate(
            meter.consumer_type,
          );

          const model = this.repo.createModel(meter);
          const estimated_balance = model.getEstimatedBalance(consumption_rate);

          return {
            ...meter,
            ...model.toJSON(),
            estimated_balance,
            low_balance_threshold,
            battery_level_threshold,
          };
        }),
        total_rows,
      },
    };
  }

  async findMeterDetails(
    user_id: string,
    organization_id: string,
    meter_name?: string,
    dev_eui?: string,
    role?: RoleTypes,
  ) {
    if (!meter_name && !dev_eui) {
      const { water_meter_id } = await this.userRepo.findOneByID(user_id);

      meter_name = water_meter_id;
    }

    const params: {
      meter_name?: string;
      dev_eui?: string;
      deleted_at?: null;
      iot_organization_id?: Mongoose.Types.ObjectId;
    } = {
      meter_name,
      dev_eui,
      deleted_at: null,
    };

    if (role == RoleTypes.admin) {
      params.iot_organization_id = new Mongoose.Types.ObjectId(organization_id);
    }

    Object.keys(params).forEach((key) =>
      params[key] === undefined ? delete params[key] : {},
    );

    const configuration = await this.configRepo.findOne(organization_id);

    const battery_level_threshold = configuration?.battery_level_threshold;

    const meter = await this.repo.findMeter(params);

    if (!meter) {
      throw new NotFoundException('Meter does not exist');
    }

    const consumption_rate = configuration?.getConsumptionRate(
      meter.consumer_type,
    );

    const water_meter_rate = meter.getWaterMeterRate(consumption_rate);
    const estimated_balance = meter.getEstimatedBalance(consumption_rate);

    let org;

    if (role == RoleTypes.superAdmin && meter.iot_organization_id) {
      org = await this.orgService.findById(
        meter.iot_organization_id.toString(),
      );
    }

    return {
      document: meter,
      custom_fields: {
        water_meter_rate,
        estimated_balance,
        battery_level_threshold,
        org,
      },
    };
  }

  async updateValve(dto: UpdateMeterValveDto): Promise<unknown> {
    const response = await this.repo.updateValve(dto);
    return { response, message: 'Meter valve status updated successfully' };
  }

  async updateMeter(
    devEUI: string,
    dto: UpdateMeterDto,
    role: RoleTypes,
  ): Promise<unknown> {
    if (role == RoleTypes.admin) {
      dto.iot_organization_id = undefined;
    }

    const meter = await this.repo.findByDevEui(devEUI);
    const old_meter_name = meter.meter_name;

    return lastValueFrom(
      from(
        (async () => {
          const response = await this.repo.updateMeter(devEUI, dto);
          return { response, message: 'Meter updated successfully' };
        })(),
      ).pipe(
        tap({
          complete: async () => {
            await this.userRepo.updateMany(
              { water_meter_id: old_meter_name },
              { water_meter_id: dto.meter_name },
            );

            await this.transactionRepo.updateMany(
              { iot_meter_id: old_meter_name },
              { iot_meter_id: dto.meter_name },
            );
          },
        }),
      ),
    );
  }

  async removeMeter(devEUI: string) {
    //TODO check if meter not yet deleted
    await this.repo.removeMeter(devEUI);
    return { message: 'Meter deleted successfully' };
  }

  async findStats(role: RoleTypes, organization_id?: string) {
    const res = await this.repo.findStats(role, organization_id);
    return { response: res };
  }

  async generateReports(organization_id: string) {
    const configuration = await this.configRepo.findOne(organization_id);
    return this.repo.generateReports(configuration, organization_id);
  }

  async changeValve(
    user_id: string,
    organization_id: string,
    dto: UpdateMeterValveDto,
  ) {
    const meter = await this.findMeterDetails(
      user_id,
      organization_id,
      undefined,
      dto.dev_eui,
    );

    const data = {};

    return lastValueFrom(
      this.iotService
        .sendOpenValveUpdate(meter.document.wireless_device_id, dto)
        .pipe(
          map(async (obs) => {
            const response = await this.repo.updateValve(dto);
            this.logService.create({
              action: dto.is_open ? Action.open : Action.close,
              meter_name: meter.document.meter_name,
              data: JSON.stringify(data),
              created_by: user_id,
              organization_id,
            });
            if (response === undefined) {
              throw new InternalServerErrorException(
                'Meter opening/closing failed. Contact your administrator.',
              );
            }
            return {
              response,
              message: 'Meter valve status updated successfully',
            };
          }),
        ),
    );
  }
}
