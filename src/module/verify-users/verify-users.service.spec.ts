import { Test, TestingModule } from '@nestjs/testing';
import { VerifyUsersService } from './verify-users.service';

describe('VerifyUsersService', () => {
  let service: VerifyUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VerifyUsersService],
    }).compile();

    service = module.get<VerifyUsersService>(VerifyUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
