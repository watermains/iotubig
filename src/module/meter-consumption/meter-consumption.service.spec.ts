import { Test, TestingModule } from '@nestjs/testing';
import { MeterConsumptionService } from './meter-consumption.service';

describe('MeterConsumptionService', () => {
  let service: MeterConsumptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeterConsumptionService],
    }).compile();

    service = module.get<MeterConsumptionService>(MeterConsumptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
