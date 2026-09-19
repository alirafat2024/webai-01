import { Test, TestingModule } from '@nestjs/testing';
import { CodingToolsService } from './coding-tools.service';

describe('CodingToolsService', () => {
  let service: CodingToolsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodingToolsService],
    }).compile();

    service = module.get<CodingToolsService>(CodingToolsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
