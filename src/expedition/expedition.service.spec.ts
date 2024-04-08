import { Test, TestingModule } from '@nestjs/testing';
import { ExpeditionService } from './expedition.service';

describe('ExpeditionService', () => {
  let service: ExpeditionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExpeditionService],
    }).compile();

    service = module.get<ExpeditionService>(ExpeditionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
