import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      ssl: true,
      sslValidate: true,
      sslCA: `${__dirname}/rds-combined-ca-bundle.pem`
    }),
  ],
})
export class MongoDBProviderModule {}
