import { Injectable } from '@nestjs/common';

import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class CodingToolsService {
  async listFiles(
    projectPath: string,
  ): Promise<string[]> {
    const files: string[] = [];

    const sourcePath = path.join(
      projectPath,
      'frontend',
      'src',
    );

    await this.collectFiles(
      sourcePath,
      projectPath,
      files,
    );

    return files;
  }

  private async collectFiles(
    directory: string,
    projectRoot: string,
    files: string[],
  ): Promise<void> {
    const entries = await fs.readdir(
      directory,
      { withFileTypes: true },
    );

    for (const entry of entries) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'build' ||
        entry.name === '.git'
      ) {
        continue;
      }

      const fullPath = path.join(
        directory,
        entry.name,
      );

      if (entry.isDirectory()) {
        await this.collectFiles(
          fullPath,
          projectRoot,
          files,
        );
      } else {
        files.push(
          path
            .relative(projectRoot, fullPath)
            .replace(/\\/g, '/'),
        );
      }
    }
  }

  async readFile(
    projectPath: string,
    relativePath: string,
  ): Promise<string> {
    const fullPath =
      this.resolveSafePath(
        projectPath,
        relativePath,
      );

    return fs.readFile(
      fullPath,
      'utf8',
    );
  }

  async writeFile(
    projectPath: string,
    relativePath: string,
    content: string,
  ): Promise<void> {
    const fullPath =
      this.resolveSafePath(
        projectPath,
        relativePath,
      );

    await fs.mkdir(
      path.dirname(fullPath),
      { recursive: true },
    );

    await fs.writeFile(
      fullPath,
      content,
      'utf8',
    );
  }

  private resolveSafePath(
    projectPath: string,
    relativePath: string,
  ): string {
    if (
      path.isAbsolute(relativePath) ||
      relativePath.includes('..')
    ) {
      throw new Error(
        `Unsafe file path: ${relativePath}`,
      );
    }

    const normalized =
      relativePath.replace(/\\/g, '/');

    if (
      normalized.startsWith('.env') ||
      normalized.includes('node_modules/') ||
      normalized.includes('.git/') ||
      normalized.includes('dist/')
    ) {
      throw new Error(
        `Protected file: ${relativePath}`,
      );
    }

    const projectRoot =
      path.resolve(projectPath);

    const fullPath =
      path.resolve(
        projectRoot,
        relativePath,
      );

    if (
      !fullPath.startsWith(
        projectRoot + path.sep,
      )
    ) {
      throw new Error(
        `File outside project: ${relativePath}`,
      );
    }

    return fullPath;
  }
}