import { BadRequestException, Injectable } from '@nestjs/common';
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

@ValidatorConstraint({ async: true })
@Injectable()
export class MeterNameExistConstraint implements ValidatorConstraintInterface {
  constructor(@InjectModel(Meter.name) private meter: Model<MeterDocument>) {}

  async validate(value: any, validationArguments?: ValidationArguments) {
    const meter = await this.meter.findOne({ meter_name: value });
    console.log(meter);
    if (meter) {
      return true;
    }
  }
}

export function MeterNameExist(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MeterNameExistConstraint,
    });
  };
}

@ValidatorConstraint({ async: true })
@Injectable()
export class MeterDevEUIExistConstraint
  implements ValidatorConstraintInterface
{
  constructor(@InjectModel(Meter.name) private meter: Model<MeterDocument>) {}

  async validate(value: any, validationArguments?: ValidationArguments) {
    const meter = await this.meter.findOne({ dev_eui: value });
    if (meter) {
      return true;
    }
  }
}

export function MeterDevEUIExist(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: MeterNameExistConstraint,
    });
  };
}
