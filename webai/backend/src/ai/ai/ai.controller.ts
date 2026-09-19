import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate')
  generate(@Body('prompt') prompt: string) {
    return this.aiService.generate(prompt);
  }
}
