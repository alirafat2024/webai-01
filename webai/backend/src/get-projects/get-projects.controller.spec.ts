import { Test, TestingModule } from '@nestjs/testing';
import { GetProjectsController } from './get-projects.controller';
import { GetProjectsService } from './get-projects.service';

describe('GetProjectsController', () => {
  let controller: GetProjectsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetProjectsController],
      providers: [GetProjectsService],
    }).compile();

    controller = module.get<GetProjectsController>(GetProjectsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
