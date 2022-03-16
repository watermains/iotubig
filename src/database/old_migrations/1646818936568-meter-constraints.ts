import { getDb } from '../migrations-utils/db';

export const up = async () => {
  const db = await getDb();
  const names = (await db.listCollections().toArray()).map((val) => val.name);
  if (names.includes('meterconsumptions')) {
    await db.collection('meterconsumptions').dropIndex('dev_eui_1');
  }
  if (names.includes('meters')) {
    await db.collection('meters').dropIndex('meter_name_1');
    await db
      .collection('meters')
      .createIndex({ meter_name: 1 }, { unique: true, sparse: true });
  }
};

export const down = async () => {
  const db = await getDb();
  const names = (await db.listCollections().toArray()).map((val) => val.name);
  if (names.includes('meterconsumptions')) {
    await db
      .collection('meterconsumptions')
      .createIndex({ dev_eui: 1 }, { unique: true });
  }
  if (names.includes('meters')) {
    await db
      .collection('meters')
      .createIndex({ meter_name: 1 }, { unique: true });
  }
};
