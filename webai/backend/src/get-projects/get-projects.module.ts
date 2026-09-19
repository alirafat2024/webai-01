import { Module } from '@nestjs/common';
import { GetProjectsService } from './get-projects.service.js';
import { GetProjectsController } from './get-projects.controller.js';
import { ProjectsModule } from '../projects/projects.module.js';

@Module({
  controllers: [GetProjectsController],
  providers: [GetProjectsService],
  imports: [ProjectsModule],
})
export class GetProjectsModule {}
