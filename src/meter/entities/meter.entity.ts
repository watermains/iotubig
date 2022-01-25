import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MeterDocument = Meter & Document;

@Schema({ timestamps: true })
export class Meter {
  @Prop({ required: true })
  meter_name: string;

  @Prop({ required: true })
  dev_eui: string;

  @Prop()
  wireless_device_id: string;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  cumulative_flow: number;

  @Prop({ type: MongooseSchema.Types.Decimal128 })
  allowed_flow: string;

  @Prop()
  battery_level: number;

  @Prop()
  battery_fault: number;

  @Prop()
  valve_status: number;

  @Prop()
  valve_fault: number;

  @Prop()
  hall_fault: number;

  @Prop()
  mag_fault: number;

  @Prop()
  site_name: string;

  @Prop()
  unit_name: string;

  @Prop()
  consumer_type: string;

  @Prop()
  deleted_by: string;

  @Prop()
  deleted_at: Date;

  @Prop()
  iot_user_id: string;

  @Prop()
  iot_organization_id: string;

  @Prop()
  frame_id: number;
}

export const MeterSchema = SchemaFactory.createForClass(Meter);
