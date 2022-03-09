import { getDb } from '../migrations-utils/db';

export const up = async () => {
  const db = await getDb();
  await db.collection('meterconsumptions').dropIndex('dev_eui_1');
  await db.collection('meters').dropIndex('meter_name_1');
  await db
    .collection('meters')
    .createIndex({ meter_name: 1 }, { unique: true, sparse: true });
};

export const down = async () => {
  const db = await getDb();
  await db
    .collection('meterconsumptions')
    .createIndex({ dev_eui: 1 }, { unique: true });
  await db.collection('meter').createIndex({ meter_name: 1 }, { unique: true });
};
