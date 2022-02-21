import { Test, TestingModule } from '@nestjs/testing';
import { ScreenerService } from './screener.service';

describe('ScreenerService', () => {
  let service: ScreenerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScreenerService],
    }).compile();

    service = module.get<ScreenerService>(ScreenerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
