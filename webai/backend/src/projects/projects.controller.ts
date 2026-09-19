import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';

import { ProjectsService } from './projects.service.js';

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
  ) {}

  @Post()
  async create(
    @Body('prompt') prompt: string,
  ) {
    if (!prompt || !prompt.trim()) {
      throw new BadRequestException(
        'Prompt is required',
      );
    }

    return this.projectsService.createProject(
      prompt.trim(),
    );
  }
}