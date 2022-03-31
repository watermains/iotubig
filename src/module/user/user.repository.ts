import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcryptjs';
import { isIn } from 'class-validator';
import { Model } from 'mongoose';
import { RoleTypes } from 'src/decorators/roles.decorator';
import { MailerService } from 'src/mailer/mailer.service';
import { Organization } from '../organization/entities/organization.schema';
import { OrganizationService } from '../organization/organization.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { User, UserDocument } from './entities/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private readonly orgService: OrganizationService,
  ) {}

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async findOneByID(id: string) {
    return this.userModel.findOne({ _id: id });
  }

  async isOwned(water_meter_id: string) {
    return this.userModel.find({
      water_meter_id,
    });
  }

  async create(dto: CreateUserDto) {
    console.log(dto);
    const createdUser = new this.userModel(dto);
    createdUser.role = RoleTypes.customer;
    createdUser.save();
    const org = await this.orgService.findById(
      createdUser.organization_id.toString(),
    );

    this.mailerService.sendWelcome(dto.first_name, dto.email, org.name);
    return { message: 'Registration Success' };
  }

  async login(dto: LoginUserDto) {
    try {
      const user = await this.userModel
        .findOne({ email: dto.email, role: RoleTypes.customer })
        .select('+password')
        .exec();
      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (isMatch) {
        const payload = {
          email: user.email,
          id: user._id,
          role: user.role,
          org_id: user.organization_id,
        };
        return {
          response: { access_token: this.jwtService.sign(payload) },
          message: 'Login Success',
        };
      }

      throw new NotFoundException(['Credentials not found']);
    } catch {
      throw new NotFoundException(['Credentials not found']);
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.findOneByEmail(dto.email);
    const payload = { email: user.email, id: user._id, role: user.role };
    const token = this.jwtService.sign(payload);
    const org = await this.orgService.findById(user.organization_id.toString());
    this.mailerService.sendForgotPassword(
      user.first_name,
      user.email,
      org.name,
      token,
    );
    return {
      message: 'Reset password link sent on your email address',
    };
  }

  async resetPassword(request, dto: ResetPasswordDto) {
    const user = await this.userModel
      .findOne({ _id: request.user.id })
      .select('+password');
    const match = await bcrypt.compare(dto.password, user.password);
    if (!match) {
      const hashedPassword = await bcrypt.hash(dto.password, 10);
      user.password = hashedPassword;
      user.save();
      return { message: 'Reset Password Success' };
    }

    throw new NotAcceptableException(['Same as old password']);
  }

  // ADMIN

  async adminLogin(loginUserDto) {
    try {
      const user = await this.userModel
        .findOne({
          email: loginUserDto.email,
          role: { $in: [RoleTypes.admin, RoleTypes.superAdmin] },
        })
        .select('+password')
        .exec();
      const isMatch = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (isMatch) {
        const payload = {
          email: user.email,
          id: user._id,
          role: user.role,
          org_id: user.organization_id,
        };
        return { response: { access_token: this.jwtService.sign(payload) } };
      }

      throw new NotFoundException(['Credentials not found']);
    } catch {
      throw new NotFoundException(['Credentials not found']);
    }
  }

  seedAdmin(data: any[]): Promise<UserDocument>[] {
    return data.map(async (body) => {
      body.password = await bcrypt.hash(body.password, 10);
      if (!isIn(body.role, [RoleTypes.admin, RoleTypes.superAdmin])) {
        throw new Error('Invalid role');
      }

      if (body.role == RoleTypes.superAdmin) {
        body.organization_id = undefined;
      }

      return this.userModel.findOneAndUpdate({ email: body.email }, body, {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      });
    });
  }

  async seedUser(data: CreateUserDto[]) {
    return data.map((user) => {
      return this.userModel.findOneAndUpdate(
        { water_meter_id: user.water_meter_id },
        { ...user, role: RoleTypes.customer },
        {
          upsert: true,
          new: true,
        },
      );
    });
  }

  async findOrganizationIdById(id: string): Promise<Organization> {
    const { organization_id } = await this.userModel.findById(id);

    if (!organization_id) {
      throw new NotFoundException([
        'Organization not found. Please contact your System Administrator',
      ]);
    }

    return organization_id;
  }

  updateMany(filter: object, update: object): any {
    return this.userModel.updateMany(filter, update);
  }

  deleteMany(filter: object): any {
    return this.userModel.deleteMany(filter);
  }
}
