import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { ConsumerType } from 'src/module/meter/enum/consumer-type.enum';
import { Organization } from 'src/module/organization/entities/organization.schema';
import { User } from 'src/module/user/entities/user.schema';

export type ConfigurationDocument = Configuration & Document;

@Schema({ timestamps: true })
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

  @Prop()
  battery_level_threshold: number;

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

  getConsumptionRate: (consumer_type: ConsumerType) => number;
}
export const ConfigurationSchema = SchemaFactory.createForClass(Configuration);

ConfigurationSchema.methods.getConsumptionRate = function (
  consumer_type: ConsumerType,
): number {
  switch (consumer_type) {
    case ConsumerType.Residential:
      return this.residential_consumption_rates;
    case ConsumerType.Commercial:
      return this.commercial_consumption_rates;
  }
};
