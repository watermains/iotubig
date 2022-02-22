import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

console.log(process.env.MONGO_URL);
console.log(__dirname + '/rds-combined-ca-bundle.pem');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.MONGO_URL, {
      ssl: true,
      sslValidate: true,
      sslCA: __dirname + '/rds-combined-ca-bundle.pem',
      useNewUrlParser: true
    }),
  ],
})
export class MongoDBProviderModule {}
