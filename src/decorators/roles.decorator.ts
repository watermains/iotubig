import { SetMetadata } from '@nestjs/common';

export enum RoleTypes {
  admin = 'admin',
  customer = 'customer',
}

export const Roles = (...roles: RoleTypes[]) => SetMetadata('roles', roles);
