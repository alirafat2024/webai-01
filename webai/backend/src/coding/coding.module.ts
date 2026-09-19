import { Module } from '@nestjs/common';

import { AiModule } from '../ai/ai/ai.module.js';
import { ProjectsModule } from '../projects/projects.module.js';

import { CodingController } from './coding.controller.js';
import { CodingService } from './coding.service.js';
import { CodingToolsService } from './coding-tools/coding-tools.service.js';

@Module({
  imports: [
    AiModule,
    ProjectsModule,
  ],
  controllers: [CodingController],
  providers: [CodingService, CodingToolsService],
})
export class CodingModule {}