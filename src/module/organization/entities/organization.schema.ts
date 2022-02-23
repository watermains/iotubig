import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from 'src/module/user/entities/user.schema';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true })
export class Organization {
  @Prop()
  name: string;

  @Prop()
  property: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
  created_by: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
  updated_by: User;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'user' })
  deleted_by: User;

  @Prop({ type: Date })
  deleted_at: Date;
}
export const OrganizationSchema = SchemaFactory.createForClass(Organization);
