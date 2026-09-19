import { Injectable } from '@nestjs/common';
import { CreateGetProjectDto } from './dto/create-get-project.dto.js';
import { UpdateGetProjectDto } from './dto/update-get-project.dto.js';
import { ProjectsService } from '../projects/projects.service.js';

@Injectable()
export class GetProjectsService {
  constructor(private readonly projectsService: ProjectsService) {}

  create(createGetProjectDto: CreateGetProjectDto) {
    return 'This action adds a new getProject';
  }

  async findAll() {
    return this.projectsService.getAllProjects();
  }

  findOne(id: number) {
    return `This action returns a #${id} getProject`;
  }

  update(id: number, updateGetProjectDto: UpdateGetProjectDto) {
    return `This action updates a #${id} getProject`;
  }

  remove(id: number) {
    return `This action removes a #${id} getProject`;
  }
}
