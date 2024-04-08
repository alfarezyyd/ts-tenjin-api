import { Test, TestingModule } from '@nestjs/testing';
import { ExpeditionController } from './expedition.controller';
import { ExpeditionService } from './expedition.service';

describe('ExpeditionController', () => {
  let controller: ExpeditionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpeditionController],
      providers: [ExpeditionService],
    }).compile();

    controller = module.get<ExpeditionController>(ExpeditionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
