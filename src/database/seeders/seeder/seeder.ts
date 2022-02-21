import { Injectable, Logger } from '@nestjs/common';
import { AdminSeederService } from '../admin/admin.service';
import { ConfigurationSeederService } from '../configuration/configuration.service';
import { OrganizationSeederService } from '../organization/organization.service';

@Injectable()
export class Seeder {
  constructor(
    private readonly logger: Logger,
    private readonly adminSeederService: AdminSeederService,
    private readonly organizationSeederService: OrganizationSeederService,
    private readonly configurationSeederService: ConfigurationSeederService,
  ) {}
  async seed() {
    let _organization = {};
    let _admin = {};

    await this.organization()
      .then(([completed, org]) => {
        _organization = org;
        Promise.resolve(completed);
      })
      .catch((error) => {
        this.logger.error('Failed seeding organization...');
        Promise.reject(error);
      });

    await this.admin(_organization)
      .then(([completed, admin]) => {
        _admin = admin;
        Promise.resolve(completed);
      })
      .catch((error) => {
        this.logger.error('Failed seeding admin...');
        Promise.reject(error);
      });

    await this.configuration(_organization, _admin)
      .then((completed) => {
        Promise.resolve(completed);
      })
      .catch((error) => {
        this.logger.error('Failed seeding configuration...');
        Promise.reject(error);
      });
  }

  async organization() {
    return await this.organizationSeederService
      .create()
      .then((createdOrganization) => {
        this.logger.debug(`Created Organization: ${createdOrganization}`);
        return Promise.resolve([true, createdOrganization]);
      })
      .catch((error) => Promise.reject(error));
  }

  async admin(organization) {
    return await this.adminSeederService
      .create(organization)
      .then((createdAdmin) => {
        this.logger.debug(`Created Admin User: ${createdAdmin}`);
        return Promise.resolve([true, createdAdmin]);
      })
      .catch((error) => Promise.reject(error));
  }

  async configuration(organization, admin) {
    return await this.configurationSeederService
      .seedConfiguration(organization, admin)
      .then((createdConfig) => {
        this.logger.debug(`Created Configuration: ${createdConfig}`);
        return Promise.resolve(true);
      })
      .catch((error) => Promise.reject(error));
  }
}