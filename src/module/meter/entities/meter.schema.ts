import Double from '@mongoosejs/double';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Organization } from 'src/module/organization/entities/organization.schema';
import { ConsumerType } from '../enum/consumer-type.enum';
import { MeterStatus } from '../enum/meter.status.enum';

export type MeterDocument = Meter & Document;

@Schema({ timestamps: true, toJSON: { getters: true } })
export class Meter {
  @Prop({ unique: true, sparse: true })
  meter_name: string;

  @Prop({ required: true, unique: true })
  dev_eui: string;

  @Prop({ default: '' })
  wireless_device_id: string;

  @Prop({
    default: 0.0,
    type: Double,
    get: (val) => val.toString(),
  })
  cumulative_flow: number;

  @Prop({
    default: 0.0,
    type: Double,
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

  @Prop({ default: ConsumerType.Residential })
  consumer_type: ConsumerType;

  @Prop({ default: null })
  deleted_by: string;

  @Prop({ default: null })
  deleted_at: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'users' })
  iot_user_id: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'organization' })
  iot_organization_id: Organization;

  @Prop({ default: 1 })
  frame_id: number;

  @Prop()
  balanceInPeso: number;

  getWaterMeterRate: (consumption_rate: number) => number;
  getEstimatedBalance: (consumption_rate: number) => number;
  addFlow: (current_flow: number, volume: number) => number;
  getCubicMeterBalance: (consumption_rate: number) => number;
}

export const MeterSchema = SchemaFactory.createForClass(Meter);

MeterSchema.virtual('valve_status_name').get(function () {
  switch (this.valve_status) {
    case MeterStatus.idle:
      return 'Idle';
    case MeterStatus.open:
      return 'Open';
    case MeterStatus.close:
      return 'Close';
    case MeterStatus.fault:
      return 'Fault';
    case MeterStatus.pendingOpen:
      return 'Pending Open';
    case MeterStatus.pendingClose:
      return 'Pending Close';
    default:
      return 'N/A';
  }
});
MeterSchema.set('toObject', { getters: true, virtuals: true });

MeterSchema.methods.addFlow = function (
  current_flow: number,
  volume: number,
): number {
  const res = Number(current_flow) + Number(volume);
  return res;
};

MeterSchema.methods.getWaterMeterRate = function (
  consumption_rate: number,
): number {
  return consumption_rate / 1000 || 0;
};

MeterSchema.methods.getEstimatedBalance = function (
  consumption_rate: number,
): number {
  const water_meter_rate = this.getWaterMeterRate(consumption_rate);
  return (Number(this.allowed_flow) || 0) * water_meter_rate;
};

MeterSchema.methods.getCubicMeterBalance = function (
  consumption_rate: number,
): number {
  return ((Number(this.allowed_flow) || 0) * consumption_rate) / 1000;
};
