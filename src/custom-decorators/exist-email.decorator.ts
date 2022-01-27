import { Injectable } from '@nestjs/common';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

import { UserRepository } from '../user/user.repository';

@ValidatorConstraint({ async: true })
@Injectable()
export class IsEmailExistConstraint implements ValidatorConstraintInterface {
  constructor(private userRepository: UserRepository) {}
  async validate(email: any, args: ValidationArguments) {
    return await this.userRepository.findOneByEmail(email).then(user => {
      if (user) return true;
      return false;
    });
  }
}

export function IsEmailExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsEmailExistConstraint,
    });
  };
}