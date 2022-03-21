import { SetMetadata } from '@nestjs/common';

export enum RoleTypes {
  admin = 'admin',
  customer = 'customer',
  superAdmin = 'super_admin',
}

export const Roles = (...roles: RoleTypes[]) => SetMetadata('roles', roles);
