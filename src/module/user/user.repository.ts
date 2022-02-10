import {
  Injectable,
  NotAcceptableException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RoleTypes } from 'src/decorators/roles.decorator';
import { Organization } from '../organization/entities/organization.schema';
import { User, UserDocument } from './entities/user.schema';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async findOneByEmail(email: string) {
    return this.userModel.findOne({ email });
  }

  async create(createUserDto) {
    const createdUser = new this.userModel(createUserDto);
    createdUser.role = RoleTypes.customer;
    createdUser.save();
    return { message: 'Registration Success' };
  }

  async login(loginUserDto) {
    try {
      const user = await this.userModel
        .findOne({ email: loginUserDto.email, role: RoleTypes.customer })
        .select('+password')
        .exec();
      const isMatch = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (isMatch) {
        const payload = { email: user.email, id: user._id, role: user.role };
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

  async forgotPassword(forgotPasswordDto) {
    const user = await this.findOneByEmail(forgotPasswordDto.email);
    const payload = { email: user.email, id: user._id, role: user.role };
    const token = this.jwtService.sign(payload);
    return {
      response: { token },
      message: 'Reset password link sent on your email address',
    };
  }

  async resetPassword(request, resetPasswordDto) {
    const user = await this.userModel
      .findOne({ _id: request.user.id })
      .select('+password');
    const match = await bcrypt.compare(
      resetPasswordDto.password,
      user.password,
    );
    if (!match) {
      const hashedPassword = await bcrypt.hash(resetPasswordDto.password, 10);
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
        .findOne({ email: loginUserDto.email, role: 'admin' })
        .select('+password')
        .exec();
      const isMatch = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      );
      if (isMatch) {
        const payload = { email: user.email, id: user._id, role: user.role };
        return { response: { access_token: this.jwtService.sign(payload) } };
      }

      throw new NotFoundException(['Credentials not found']);
    } catch {
      throw new NotFoundException(['Credentials not found']);
    }
  }
  async seedAdmin(body) {
    body.password = await bcrypt.hash(body.password, 10);
    return this.userModel.findOneAndUpdate({ email: body.email }, body, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
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
}
