import { Injectable, NotFoundException } from '@nestjs/common';
import { CodingToolsService } from './coding-tools/coding-tools.service.js';
import * as fs from 'fs/promises';
import * as path from 'path';

import { AiService } from '../ai/ai/ai.service.js';
import { ProjectsService } from '../projects/projects.service.js';

@Injectable()
export class CodingService {
  constructor(
    private readonly aiService: AiService,
    private readonly projectsService: ProjectsService,
    private readonly codingTools: CodingToolsService,
  ) {}

  async modifyProject(projectId: string, prompt: string) {
    const project = await this.projectsService.getProject(projectId);

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const projectPath = path.resolve(process.cwd(), '..', project.folderPath);

    const availableFiles = await this.codingTools.listFiles(projectPath);

    console.log(`[${projectId}] Available files:`, availableFiles);

    const selectedFiles = await this.aiService.selectFilesForTask(
      prompt,
      availableFiles,
    );

    console.log(`[${projectId}] AI selected files:`, selectedFiles);

    const files: {
      path: string;
      content: string;
    }[] = [];

    for (const filePath of selectedFiles) {
      try {
        const content = await this.codingTools.readFile(projectPath, filePath);

        files.push({
          path: filePath,
          content,
        });
      } catch (error) {
        console.log(`[Coding] Could not read ${filePath}:`, error);
      }
    }

    console.log(`[${projectId}] Sending ${files.length} files to Groq`);

    const changes = await this.aiService.generateCodeChanges(prompt, files);

    const appliedChanges = await this.applyChanges(
      projectPath,
      changes.changes,
    );

    return {
      projectId,
      prompt,
      changes: appliedChanges,
    };
  }
  ////////////Write file ///////////////////
  private async applyChanges(
    projectPath: string,
    changes: {
      file: string;
      action: 'modify' | 'create' | 'delete';
      content: string | null;
    }[],
  ) {
    const results: {
      file: string;
      action: string;
      status: string;
    }[] = [];

    for (const change of changes) {
      const relativePath = change.file;

      // Prevent path traversal
      if (path.isAbsolute(relativePath) || relativePath.includes('..')) {
        throw new Error(`Unsafe file path rejected: ${relativePath}`);
      }

      // Prevent access to protected files/directories
      const normalizedPath = relativePath.replace(/\\/g, '/');

      if (
        normalizedPath.startsWith('.env') ||
        normalizedPath.includes('node_modules/') ||
        normalizedPath.includes('.git/') ||
        normalizedPath.includes('dist/')
      ) {
        throw new Error(`Protected file rejected: ${relativePath}`);
      }

      const fullPath = path.resolve(projectPath, relativePath);

      // Extra safety check: resolved path must remain inside project
      const normalizedProjectPath = path.resolve(projectPath) + path.sep;

      if (!fullPath.startsWith(normalizedProjectPath)) {
        throw new Error(`File is outside project directory: ${relativePath}`);
      }

      const exists = await this.fileExists(fullPath);

      if (change.action === 'delete') {
        if (exists) {
          await fs.unlink(fullPath);

          results.push({
            file: relativePath,
            action: 'delete',
            status: 'deleted',
          });
        } else {
          results.push({
            file: relativePath,
            action: 'delete',
            status: 'already_missing',
          });
        }

        continue;
      }

      if (change.content === null || change.content === undefined) {
        throw new Error(`Missing content for ${relativePath}`);
      }

      await fs.mkdir(path.dirname(fullPath), { recursive: true });

      await fs.writeFile(fullPath, change.content, 'utf8');

      results.push({
        file: relativePath,
        action: exists ? 'modify' : 'create',
        status: exists ? 'modified' : 'created',
      });
    }

    return results;
  }
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
