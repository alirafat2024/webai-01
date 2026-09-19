import { Module } from '@nestjs/common';
import { RunnerService } from './runner.service.js';
import { RunnerController } from './runner.controller.js';
import { ProjectsModule } from '../projects/projects.module.js';
@Module({
  imports: [ProjectsModule],
  controllers: [RunnerController],
  providers: [RunnerService],
})
export class RunnerModule {}
