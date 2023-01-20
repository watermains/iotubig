import { SetMetadata } from '@nestjs/common';

export enum RoleTypes {
  admin = 'admin',
  buildingManager = 'building_manager',
  customer = 'customer',
  superAdmin = 'super_admin',
}

export const Roles = (...roles: RoleTypes[]) => SetMetadata('roles', roles);
