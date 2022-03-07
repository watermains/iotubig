/* eslint-disable @typescript-eslint/no-var-requires */
const mongoose = require('mongoose');

const { ConfigModule } = require('@nestjs/config');

// Load environment variables from .env
ConfigModule.forRoot();

mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });

const createModel = (name) => {
  return mongoose.model(name, new mongoose.Schema());
};

module.exports = {
  createModel,
};
