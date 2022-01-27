import { Command } from 'nestjs-command';
import { Injectable } from '@nestjs/common';
import { AdminService } from './admin.service';

@Injectable()
export class AdminSeeder {
  constructor(private readonly adminService: AdminService) {}

  @Command({ command: 'create:admin', describe: 'create an admin account' })
  async create() {
    const user = await this.adminService.create({
      first_name: 'Admin',
      last_name: 'IoTubig',
      email: 'dev@umpisa.co',
      password: 'ump1sa',
      role: 'admin',
    });
    console.log(user);
  }
}
