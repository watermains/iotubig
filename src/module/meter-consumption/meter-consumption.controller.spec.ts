import { Test, TestingModule } from '@nestjs/testing';
import { MeterConsumptionController } from './meter-consumption.controller';
import { MeterConsumptionService } from './meter-consumption.service';

describe('MeterConsumptionController', () => {
  let controller: MeterConsumptionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MeterConsumptionController],
      providers: [MeterConsumptionService],
    }).compile();

    controller = module.get<MeterConsumptionController>(MeterConsumptionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
