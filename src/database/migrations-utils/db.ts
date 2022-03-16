import { ConfigModule } from '@nestjs/config';
import { MongoClient } from 'mongodb';
import { Mongoose } from 'mongoose';

export const getDb = async () => {
  ConfigModule.forRoot();
  const mongoose = new Mongoose();
  mongoose.connect(process.env.MONGO_URL, {
    directConnection: true,
  });
  // const client: MongoClient = await MongoClient.connect(process.env.MONGO_URL, {
  //   directConnection: true,
  // });
  // return client.db();
  return mongoose;
};
