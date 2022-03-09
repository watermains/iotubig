import { ConfigModule } from '@nestjs/config';
import { MongoClient } from 'mongodb';

export const getDb = async () => {
  ConfigModule.forRoot();
  const client: any = await MongoClient.connect(process.env.MONGO_URL, {
    directConnection: true,
  });
  return client.db();
};
