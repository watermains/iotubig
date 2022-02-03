import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Organization } from 'src/organization/entities/organization.schema';
import { User } from 'src/user/entities/user.schema';

export type ConfigurationDocument = Configuration & Document

@Schema({ timestamps: true})
export class Configuration {
  @Prop()
  water_alarm_threshold: number;

  @Prop()
  overdraw_limitation: number;

  @Prop()
  minimum_monthly_consumer_deduction: number;

  @Prop()
  residential_consumption_rates: number;

  @Prop()
  commercial_consumption_rates: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
  created_by: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
  updated_by: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
  deleted_by: User;

  @Prop({ type: Date })
  deleted_at: Date;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'organization' })
  organization_id: Organization;
}
export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);