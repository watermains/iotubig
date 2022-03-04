import { Test, TestingModule } from '@nestjs/testing';
import { AdminSeederService } from './admin.service';

describe('AdminSeederService', () => {
  let service: AdminSeederService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminSeederService],
    }).compile();

    service = module.get<AdminSeederService>(AdminSeederService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
