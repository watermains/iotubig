import { ConfigModule } from '@nestjs/config';
import { MongoClient } from 'mongodb';

export const getDb = async () => {
  ConfigModule.forRoot();
  const client: MongoClient = await MongoClient.connect(process.env.MONGO_URL, {
    directConnection: true,
  });
  return client.db();
};
