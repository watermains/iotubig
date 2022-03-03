import { Injectable, Logger } from '@nestjs/common';
import { AdminSeederService } from '../admin/admin.service';
import { ConfigurationSeederService } from '../configuration/configuration.service';
import { MeterConsumptionSeederService } from '../consumption/consumption.service';
import { OrganizationSeederService } from '../organization/organization.service';
import { TransactionSeederService } from '../transaction/transaction.service';
import { UserSeederService } from '../user/user.service';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly adminSeederService: AdminSeederService,
    private readonly organizationSeederService: OrganizationSeederService,
    private readonly configurationSeederService: ConfigurationSeederService,
    private readonly transactionSeederService: TransactionSeederService,
    private readonly meterConsumptionSeederService: MeterConsumptionSeederService,
    private readonly userSeederService: UserSeederService,
  ) {}
  async seed() {
    let _organization = {};
    let _admin = {};

    await this.organization()
      .then(([completed, org]) => {
        _organization = org;
        return completed;
      })
      .catch((error) => {
        this.logger.error('Failed seeding organization...');
        return error;
      });

    await this.admin(_organization)
      .then(([completed, admin]) => {
        _admin = admin;
        return completed;
      })
      .catch((error) => {
        this.logger.error('Failed seeding admin...');
        return error;
      });

    await this.configuration(_organization, _admin)
      .then((completed) => {
        return completed;
      })
      .catch((error) => {
        this.logger.error('Failed seeding configuration...');
        return error;
      });

    if (process.env.NODE_ENV === 'development') {
      await this.consumption(_organization)
        .then((completed) => {
          return completed;
        })
        .catch((err) => {
          this.logger.error('Failed seeding configuration...');
          return err;
        });

      await this.users(_organization)
        .then((completed) => {
          return completed;
        })
        .catch((err) => {
          this.logger.error('Failed seeding users...');
          return err;
        });
    }
  }

  async organization() {
    return await this.organizationSeederService
      .create()
      .then((createdOrganization) => {
        this.logger.debug(`Created Organization: ${createdOrganization}`);
        return [true, createdOrganization];
      })
      .catch((error) => error);
  }

  async admin(organization) {
    return await this.adminSeederService
      .create(organization)
      .then((createdAdmin) => {
        this.logger.debug(`Created Admin User: ${createdAdmin}`);
        return [true, createdAdmin];
      })
      .catch((error) => error);
  }

  async configuration(organization, admin) {
    return await this.configurationSeederService
      .seedConfiguration(organization, admin)
      .then((createdConfig) => {
        this.logger.debug(`Created Configuration: ${createdConfig}`);
        return true;
      })
      .catch((error) => error);
  }

  async consumption(organization) {
    return Promise.all(
      await this.meterConsumptionSeederService.create(organization),
    )
      .then((result) => {
        this.logger.debug(`Created Consumption: ${result}`);
        return true;
      })
      .catch((error) => error);
  }

  async users(organization) {
    return Promise.all(await this.userSeederService.create(organization))
      .then((result) => {
        this.logger.debug(`Created Test Users: ${result}`);
        return true;
      })
      .catch((error) => error);
  }
}
