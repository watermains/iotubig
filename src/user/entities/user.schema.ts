import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Organization } from 'src/organization/entities/organization.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true})
export class User {
  @Prop()
  water_meter_id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  role: string;  

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'organization' })
  organization_id: Organization;
}

export const UserSchema = SchemaFactory.createForClass(User);
