import { Test, TestingModule } from '@nestjs/testing';
import { AssistanceService } from './assistance.service';

describe('AssistanceService', () => {
  let service: AssistanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AssistanceService],
    }).compile();

    service = module.get<AssistanceService>(AssistanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
