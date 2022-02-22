import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

var key = require('fs').readFileSync('rds-combined-ca-bundle.pem');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      ssl: true,
      sslValidate: true,
      sslCA: key
    }),
  ],
})
export class MongoDBProviderModule {}
