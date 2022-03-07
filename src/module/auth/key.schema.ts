import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Organization } from 'src/module/organization/entities/organization.schema';

export type KeyDocument = Key & Document;

@Schema({ timestamps: true })
export class Key {
  @Prop()
  value: string;

  @Prop()
  organization_name: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'organization' })
  organization_id: Organization;
}

export const KeySchema = SchemaFactory.createForClass(Key);
