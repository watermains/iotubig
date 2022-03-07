import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthRepository } from './auth.repository';
import { CreateAPIKeyDto } from './dto/auth.dto';
import { Key, KeyDocument } from './key.schema';

@Injectable()
export class AuthService {
  constructor(private readonly repo: AuthRepository) {}

  async validateApiKey(key: string): Promise<Key> {
    return await this.repo.validateApiKey(key);
  }

  generateKey(dto: CreateAPIKeyDto) {
    return this.repo.generateKey(dto.organization_name, dto.organization_id);
  }
}
