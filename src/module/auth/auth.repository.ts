import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Key, KeyDocument } from './key.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthRepository {
  constructor(
    @InjectModel(Key.name) private readonly keyModel: Model<KeyDocument>,
  ) {}

  async validateApiKey(key: string): Promise<Key> {
    const isExist = await this.keyModel.findOne({ value: key });
    return isExist;
  }

  async generateKey(organization_name: string, organization_id: string) {
    const salt = await bcrypt.genSalt(10);
    const value = bcrypt.hashSync(process.env.JWT_SECRET, salt);
    const key = await this.keyModel.create({
      organization_name,
      value,
      organization_id,
    });
    return {
      response: {
        key: key.value,
      },
    };
  }
}

//$2b$10$n9HS54UJQ/laOtlkPK9DOu6mOd4DY1rvdPnr4CLxdx.KkF5HfLxmO
