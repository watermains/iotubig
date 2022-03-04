import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true, toJSON: { getters: true } })
export class Transaction {
  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  reference_no: number;

  @Prop({ required: true })
  volume: number;

  @Prop({ required: true })
  current_meter_volume: number;

  @Prop({
    required: true,
    type: MongooseSchema.Types.Decimal128,
    get: (val) => val.toString(),
  })
  rate: number;

  @Prop({ required: true })
  created_by: string;

  @Prop()
  deleted_at: Date;

  @Prop({ required: true })
  iot_meter_id: string;

  @Prop({ required: true })
  dev_eui: string;

  @Prop({ default: '' })
  site_name: string;

  @Prop({ default: '' })
  unit_name: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
