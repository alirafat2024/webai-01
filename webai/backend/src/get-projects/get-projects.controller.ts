import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GetProjectsService } from './get-projects.service.js';
import { CreateGetProjectDto } from './dto/create-get-project.dto.js';
import { UpdateGetProjectDto } from './dto/update-get-project.dto.js';

@Controller('get-projects')
export class GetProjectsController {
  constructor(private readonly getProjectsService: GetProjectsService) {}

  @Post()
  create(@Body() createGetProjectDto: CreateGetProjectDto) {
    return this.getProjectsService.create(createGetProjectDto);
  }

  @Get()
  findAll() {
    return this.getProjectsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.getProjectsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGetProjectDto: UpdateGetProjectDto) {
    return this.getProjectsService.update(+id, updateGetProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.getProjectsService.remove(+id);
  }
}
