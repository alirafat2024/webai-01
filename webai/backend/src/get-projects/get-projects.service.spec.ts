import { Test, TestingModule } from '@nestjs/testing';
import { GetProjectsService } from './get-projects.service';

describe('GetProjectsService', () => {
  let service: GetProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GetProjectsService],
    }).compile();

    service = module.get<GetProjectsService>(GetProjectsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
