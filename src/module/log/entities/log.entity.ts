import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
}

export const LogSchema = SchemaFactory.createForClass(Log);
