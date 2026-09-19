import { Controller, Param, Post } from '@nestjs/common';
import { RunnerService } from './runner.service.js';

@Controller('projects')
export class RunnerController {
  constructor(private readonly runnerService: RunnerService) {}

  @Post(':projectId/start')
  async startProject(@Param('projectId') projectId: string) {
    return this.runnerService.startProject(projectId);
  }

  @Post(':projectId/stop')
  async stopProject(@Param('projectId') projectId: string) {
    return this.runnerService.stopProject(projectId);
  }
}