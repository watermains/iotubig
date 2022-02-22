import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

var key = require('fs').readFileSync(__dirname + '/rds-combined-ca-bundle.pem');

console.log(process.env.MONGO_URL);
console.log(key);

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      ssl: true,
      sslValidate: true,
      sslCA: key,
      useNewUrlParser: true
    }),
  ],
})
export class MongoDBProviderModule {}
