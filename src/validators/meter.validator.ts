import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Model } from 'mongoose';
import { Meter, MeterDocument } from 'src/module/meter/entities/meter.schema';
import { MeterRepository } from 'src/module/meter/meter.repository';

export enum MeterField {
  devEUI = 'dev_eui',
  name = 'meter_name',
}
export class MeterValidationOptions {
  field: MeterField;
  unique?: boolean;
  exist?: boolean;
}

@ValidatorConstraint({ async: true })
@Injectable()
export class MeterCheckConstraint implements ValidatorConstraintInterface {
  constructor(private readonly repo: MeterRepository) {}

  async validate(value: any, args: ValidationArguments) {
    const constraints = args.constraints;
    if (
      constraints.length != 1 ||
      constraints[0] instanceof MeterValidationOptions
    ) {
      throw new InternalServerErrorException('Invalid Meter Constraints set');
    }
    const params = constraints[0] as MeterValidationOptions;
    const field = params.field;
    const whereClause = new Map<string, unknown>();
    whereClause[field] = value;
    const meter = await this.repo.findMeter(whereClause);
    if (
      (params.exist === undefined && params.unique === undefined) ||
      (params.exist !== undefined && params.unique !== undefined)
    ) {
      throw new InternalServerErrorException(
        'At least 1 constraint should be chosen',
      );
    }

    if (params.exist) {
      if (meter) {
        return true;
      }
      return false;
    }
    if (params.unique) {
      if (meter) {
        return false;
      }
      return true;
    }
  }
}

export function MeterCheck(
  options: MeterValidationOptions,
  validationOptions?: ValidationOptions,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [options],
      validator: MeterCheckConstraint,
    });
  };
}
