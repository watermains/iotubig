import { Test, TestingModule } from '@nestjs/testing';
import { VerifyUsersController } from './verify-users.controller';

describe('VerifyUsersController', () => {
  let controller: VerifyUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VerifyUsersController],
    }).compile();

    controller = module.get<VerifyUsersController>(VerifyUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
