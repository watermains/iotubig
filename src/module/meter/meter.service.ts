import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as Mongoose from 'mongoose';
import { from, lastValueFrom, map, tap } from 'rxjs';
import { meterTableIndex } from 'src/common/helper';
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
import * as moment from 'moment';
import { BatteryLevel } from './enum/battery-level.enum';
import { BalanceStatus } from './enum/balance-status.enum';

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

    const isChanged =
      oldMeter !== null ? meter.valve_status !== oldMeter.valve_status : false;

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
          isChanged,
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
    valve_status: MeterStatus = MeterStatus.all,
    consumer_type: ConsumerType = ConsumerType.All,
    search?: string,
    role?: RoleTypes,
    iot_organization_id?: string,
    transactable?: boolean,
    allowed_flow?: number,
    sortIndex?: number,
    ascending?: string,
    battery_level: BatteryLevel = BatteryLevel.all,
    balance_status: BalanceStatus = BalanceStatus.all,
  ) {
    const configuration = await this.configRepo.findOne(organization_id);

    const low_balance_threshold = configuration?.water_alarm_threshold;
    const battery_level_threshold = configuration?.battery_level_threshold;
    const sort_by = meterTableIndex(sortIndex);
    const $sort = { [sort_by]: ascending === 'true' ? 1 : -1 };

    const $match: {
      deleted_at: null;
      valve_status?: MeterStatus;
      consumer_type?: ConsumerType;
      $or?: unknown[];
      iot_organization_id?: Mongoose.Types.ObjectId;
      wireless_device_id?: { $nin: unknown[] };
      meter_name?: { $nin: unknown[] };
      allowed_flow?: number | { $lte: number; };
      battery_level?: { $lte: number; };
    } = {
      deleted_at: null,
    };

    if (allowed_flow) {
      $match.allowed_flow = Number(allowed_flow);
    }

    if (Number(balance_status) !== BalanceStatus.all) {
      $match.allowed_flow = {$lte : low_balance_threshold};
    }

    if (Number(battery_level) !== BatteryLevel.all) {
      $match.battery_level = {$lte : battery_level_threshold};
    }

    if (Number(valve_status) !== MeterStatus.all) {
      $match.valve_status = Number(valve_status);
    }

    if (consumer_type !== ConsumerType.All) {
      $match.consumer_type = consumer_type;
    }

    if (Boolean(transactable)) {
      $match.wireless_device_id = { $nin: [null, ''] };
      $match.meter_name = { $nin: [null, ''] };
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
      $sort,
      offset,
      pageSize,
    );


    const meters = await Promise.all(
      data.map(async (meter) => {
        const response = await this.userRepo.findActiveUserByMeter(meter.meter_name);
        const model = this.repo.createModel(meter);
        const estimated_balance = meter.allowed_flow;
        const last_uplink = moment(meter.updatedAt).format('LLL');
        return {
          ...meter,
          ...model.toJSON(),
          estimated_balance,
          low_balance_threshold,
          battery_level_threshold,
          last_uplink,
          full_name: `${response[0]?.first_name ?? 'VACANT'} ${response[0]?.last_name ?? ''}`,
          email: response[0]?.email ?? '',
        };
      }),
    );

    return {
      response: {
        meters,
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
    email?: string,
    phone?: string,
  ) {
    if (!meter_name && !dev_eui) {
      const { water_meter_id, email : _email, phone: _phone } = await this.userRepo.findOneByID(user_id);

      meter_name = water_meter_id;
      email = _email;
      phone = _phone;
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
    // const estimated_balance = meter.getEstimatedBalance(consumption_rate);
    const estimated_balance = Number(meter.allowed_flow);

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
        email,
        phone,
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
    const meter = await this.repo.findByDevEui(devEUI);
    const old_meter_name = meter.meter_name;

    if (role == RoleTypes.admin) {
      dto.iot_organization_id = undefined;
    } else if (role == RoleTypes.superAdmin) {
      if (meter.iot_organization_id) {
        throw new UnauthorizedException();
      }

      Object.keys(dto).forEach((key) => {
        if (key != 'iot_organization_id') {
          dto[key] = undefined;
        }
      });
    }

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

  async unlinkMeter(dev_eui: string) {
    const meter = await this.repo.findByDevEui(dev_eui);
    const water_meter_id = meter.meter_name;

    return lastValueFrom(
      from(
        (async () => {
          await this.repo.unlinkMeter(meter);
          return { message: 'Meter unlinked successfully' };
        })(),
      ).pipe(
        tap({
          complete: async () => {
            await this.userRepo.deleteMany({ water_meter_id });
          },
        }),
      ),
    );
  }

  async findStats(role: RoleTypes, organization_id?: string) {
    const res = await this.repo.findStats(role, organization_id);
    return { response: res };
  }

  async findLatestUplink(organization_id?: string) {
    const res = await this.repo.findLatestUplink(organization_id);
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
    role: RoleTypes,
  ) {
    const meter = await this.findMeterDetails(
      user_id,
      organization_id,
      undefined,
      dto.dev_eui,
    );

    if (!meter.document.wireless_device_id) {
      throw new BadRequestException(
        'No wiress device id found for this meter.',
      );
    }

    if (role == RoleTypes.superAdmin && !organization_id) {
      organization_id = meter.document.iot_organization_id.toString();
    }

    const data = {};

    return lastValueFrom(
      this.iotService
        .sendOpenValveUpdate(
          meter.document.wireless_device_id,
          meter.document.meter_name,
          meter.document.site_name,
          dto,
        )
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
