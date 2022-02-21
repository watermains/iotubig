import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/module/user/entities/user.schema';
import { AdminSeederService } from './admin.service';
import { UserRepository } from 'src/module/user/user.repository';
import { MailerModule } from 'src/mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.JWT_EXPIRATION },
    }),
    MailerModule,
  ],
  providers: [AdminSeederService, UserRepository],
  exports: [AdminSeederService],
})
export class AdminSeederModule {}
