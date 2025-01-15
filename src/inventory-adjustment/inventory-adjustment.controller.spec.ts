import { Test, TestingModule } from '@nestjs/testing';
import { InventoryAdjustmentController } from './inventory-adjustment.controller';
import { InventoryAdjustmentService } from './inventory-adjustment.service';

describe('InventoryAdjustmentController', () => {
  let controller: InventoryAdjustmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InventoryAdjustmentController],
      providers: [InventoryAdjustmentService],
    }).compile();

    controller = module.get<InventoryAdjustmentController>(InventoryAdjustmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
