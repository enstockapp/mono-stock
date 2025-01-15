import { Test, TestingModule } from '@nestjs/testing';
import { InventoryAdjustmentService } from './inventory-adjustment.service';

describe('InventoryAdjustmentService', () => {
  let service: InventoryAdjustmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InventoryAdjustmentService],
    }).compile();

    service = module.get<InventoryAdjustmentService>(InventoryAdjustmentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
