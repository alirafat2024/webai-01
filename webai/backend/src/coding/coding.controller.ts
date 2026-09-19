import {
  Body,
  Controller,
  Post,
} from '@nestjs/common';

import { CodingService } from './coding.service.js';

@Controller('coding')
export class CodingController {
  constructor(
    private readonly codingService: CodingService,
  ) {}

  @Post('modify')
  async modifyProject(
    @Body()
    body: {
      projectId: string;
      prompt: string;
    },
  ) {
    return this.codingService.modifyProject(
      body.projectId,
      body.prompt,
    );
  }
}