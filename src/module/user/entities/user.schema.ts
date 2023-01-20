import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Organization } from 'src/module/organization/entities/organization.schema';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop()
  water_meter_id: string;

  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  email: string;
  
  @Prop({default: ''})
  @IsOptional()
  phone: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop()
  role: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'organization' })
  organization_id: Organization;

  @Prop()
  isActive: boolean;

  @Prop()
  isDeactivated: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
