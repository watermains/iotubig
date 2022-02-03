import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MeterDocument = Meter & Document;

@Schema({ timestamps: true, toJSON: { getters: true } })
export class Meter {
  @Prop({ required: true, unique: true })
  meter_name: string;

  @Prop({ required: true, unique: true })
  dev_eui: string;

  @Prop({ default: '' })
  wireless_device_id: string;

  @Prop({
    default: 0.0,
    type: MongooseSchema.Types.Decimal128,
    get: (val) => val.toString(),
  })
  cumulative_flow: number;

  @Prop({
    default: 0.0,
    type: MongooseSchema.Types.Decimal128,
    get: (val) => val.toString(),
  })
  allowed_flow: number;

  @Prop({ default: 0 })
  battery_level: number;

  @Prop({ default: 0 })
  battery_fault: number;

  @Prop({ default: 0 })
  valve_status: number;

  @Prop({ default: 0 })
  valve_fault: number;

  @Prop({ default: 0 })
  hall_fault: number;

  @Prop({ default: 0 })
  mag_fault: number;

  @Prop({ default: '' })
  site_name: string;

  @Prop({ default: '' })
  unit_name: string;

  @Prop({ default: 'residential' })
  consumer_type: string;

  @Prop({ default: null })
  deleted_by: string;

  @Prop({ default: null })
  deleted_at: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users' })
  iot_user_id: string;

  @Prop()
  iot_organization_id: string;

  @Prop({ default: 1 })
  frame_id: number;
  
  @Prop()
  balanceInPeso: number;
}

export const MeterSchema = SchemaFactory.createForClass(Meter);
