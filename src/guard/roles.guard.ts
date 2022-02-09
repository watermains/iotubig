import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { RoleTypes } from 'src/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles =
      this.reflector.get<RoleTypes[]>('roles', context.getHandler()) || [];

    const rolesClass =
      this.reflector.get<RoleTypes[]>('roles', context.getClass()) || [];

    if (!roles.length && !rolesClass.length) {
      return true;
    }

    const allRoles = [...roles, ...rolesClass];

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new InternalServerErrorException(
        'Cannot verify user authorization',
      );
    }
    const role = user.role;
    return allRoles.includes(role);
  }
}
