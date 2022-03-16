import { Model } from 'mongoose';
import { Meter, MeterDocument } from 'src/module/meter/entities/meter.schema';
import { getDb } from '../migrations-utils/db';

export const up = async () => {
  const db = await getDb();
};

export const down = async () => {
  const db = await getDb();
};
