import { Test, TestingModule } from '@nestjs/testing';
import { CodingController } from './coding.controller';
import { CodingService } from './coding.service';

describe('CodingController', () => {
  let controller: CodingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodingController],
      providers: [CodingService],
    }).compile();

    controller = module.get<CodingController>(CodingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
