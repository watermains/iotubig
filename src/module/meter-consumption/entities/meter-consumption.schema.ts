import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MeterConsumptionDocument = MeterConsumption & Document;

@Schema({ timestamps: true, toJSON: { getters: true } })
export class MeterConsumption {
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

  @Prop({ default: null })
  consumed_at: Date;

  @Prop({ default: 1 })
  frame_id: number;
}

export const MeterConsumptionSchema =
  SchemaFactory.createForClass(MeterConsumption);
