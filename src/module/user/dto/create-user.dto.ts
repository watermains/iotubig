import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { IsEmailAlreadyExist } from 'src/decorators/unique-email.decorator';
import { MeterCheck, MeterField } from 'src/validators/meter.validator';

export class CreateUserDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  @IsOptional()
  @MeterCheck(
    { field: MeterField.name, exist: true },
    { message: 'Meter does not exist' },
  )
  private _water_meter_id: string;
  public get water_meter_id(): string {
    return this._water_meter_id;
  }
  public set water_meter_id(value: string) {
    this._water_meter_id = value;
  }

  @ApiProperty({ type: 'string' })
  @IsString()
  first_name: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  last_name: string;

  @ApiProperty({ type: 'string' })
  @IsEmail()
  @IsEmailAlreadyExist({
    message: 'Email $value already exists. Choose another email.',
  })
  email: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  password: string;

  @ApiProperty({ type: 'string' })
  @IsString()
  organization_id: string;
}
