/* eslint-disable @typescript-eslint/no-var-requires */
const { createModel } = require('./models');
const MeterConsumption = createModel('MeterConsumption');

/**
 * Make any changes you need to make to the database here
 */
async function up() {
  // Write migration here
  await MeterConsumption.collection.dropIndex({ dev_eui: 1 });
}

/**
 * Make any changes that UNDO the up function side effects here (if possible)
 */
async function down() {
  // Write migration here
  await MeterConsumption.collection.createIndex(
    { dev_eui: 1 },
    { unique: true },
  );
}

module.exports = { up, down };
