import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity.js';

import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}
  ////////////////create function ////////////////
  async createProject(prompt: string) {
    const projectId = await this.getNextProjectId();
    const ports = await this.getNextPorts();
    const rootPath = path.resolve(process.cwd(), '..');
    const templatePath = path.join(rootPath, 'templates', 'angular-nest');

    const projectsPath = path.join(rootPath, 'builder', 'projects');

    const projectPath = path.join(projectsPath, projectId);

    await fs.mkdir(projectPath, {
      recursive: true,
    });

    await this.copyDirectory(
      path.join(templatePath, 'frontend'),
      path.join(projectPath, 'frontend'),
    );

    await this.copyDirectory(
      path.join(templatePath, 'backend'),
      path.join(projectPath, 'backend'),
    );

    await fs.mkdir(path.join(projectPath, 'database'), {
      recursive: true,
    });

    const project = this.projectRepository.create({
      projectId,
      name: 'New Project',
      prompt,
      folderPath: `builder/projects/${projectId}`,
      status: 'created',
      frontendPort: ports.frontendPort,
      backendPort: ports.backendPort,
    });

    return this.projectRepository.save(project);
  }

  /////////////////////copy function/////////////
  private async copyDirectory(
    source: string,
    destination: string,
  ): Promise<void> {
    await fs.mkdir(destination, {
      recursive: true,
    });

    const entries = await fs.readdir(source, {
      withFileTypes: true,
    });

    for (const entry of entries) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === '.git' ||
        entry.name === 'coverage' ||
        entry.name === '.env'
      ) {
        continue;
      }

      const sourcePath = path.join(source, entry.name);

      const destinationPath = path.join(destination, entry.name);

      if (entry.isDirectory()) {
        await this.copyDirectory(sourcePath, destinationPath);
      } else {
        await fs.copyFile(sourcePath, destinationPath);
      }
    }
  }
  // 2. Generate next project ID
  private async getNextProjectId(): Promise<string> {
    const projects = await this.projectRepository.find({
      order: {
        id: 'DESC',
      },
      take: 1,
    });

    if (projects.length === 0) {
      return 'project-1';
    }

    const lastProject = projects[0];

    const match = lastProject.projectId.match(/^project-(\d+)$/);

    if (!match) {
      return 'project-1';
    }

    const nextNumber = Number(match[1]) + 1;

    return `project-${nextNumber}`;
  }

  //////generate project port dynamicaly ///////////////////
  private async getNextPorts(): Promise<{
    frontendPort: number;
    backendPort: number;
  }> {
    const projects = await this.projectRepository.find();

    const usedFrontendPorts = projects
      .map((project) => project.frontendPort)
      .filter((port): port is number => port !== null);

    const usedBackendPorts = projects
      .map((project) => project.backendPort)
      .filter((port): port is number => port !== null);

    let frontendPort = 4201;
    let backendPort = 5001;

    while (usedFrontendPorts.includes(frontendPort)) {
      frontendPort++;
    }

    while (usedBackendPorts.includes(backendPort)) {
      backendPort++;
    }

    return {
      frontendPort,
      backendPort,
    };
  }
  //////get project ///////
  async getProject(projectId: string) {
    const project = await this.projectRepository.findOne({
      where: { projectId },
    });
    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }
    return project;
  }

  //////get all projects ///////
  async getAllProjects() {
    return this.projectRepository.find();
  }
}
