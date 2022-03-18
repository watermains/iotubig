import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Organization } from 'src/module/organization/entities/organization.schema';

export type LogDocument = Log & Document;

@Schema({ timestamps: true, toJSON: { getters: true } })
export class Log {
  @Prop()
  meter_name: string;

  @Prop()
  action: string;

  @Prop()
  data: string;

  @Prop()
  created_by: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'organization' })
  organization_id: Organization;
}

export const LogSchema = SchemaFactory.createForClass(Log);
