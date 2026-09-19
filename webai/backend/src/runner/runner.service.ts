import { Injectable, NotFoundException } from '@nestjs/common';

import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as net from 'net';

import { ProjectsService } from '../projects/projects.service.js';

@Injectable()
export class RunnerService {
  private processes = new Map<string, ChildProcess[]>();

  constructor(private readonly projectsService: ProjectsService) {}
  ////////////////Start project//////////
  async startProject(projectId: string) {
    const project = await this.projectsService.getProject(projectId);

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    const projectPath = path.resolve(process.cwd(), '..', project.folderPath);

    const frontendPath = path.join(projectPath, 'frontend');
    const backendPath = path.join(projectPath, 'backend');

    console.log(`Starting project: ${project.projectId}`);
    console.log(`Project path: ${projectPath}`);
    console.log(`Frontend path: ${frontendPath}`);
    console.log(`Backend path: ${backendPath}`);

    const frontendNodeModules = path.join(frontendPath, 'node_modules');
    const backendNodeModules = path.join(backendPath, 'node_modules');

    const frontendExists = await this.directoryExists(frontendNodeModules);
    const backendExists = await this.directoryExists(backendNodeModules);

    console.log(`Frontend node_modules exists: ${frontendExists}`);
    console.log(`Backend node_modules exists: ${backendExists}`);

    if (!frontendExists) {
      try {
        console.log(`Installing frontend dependencies...`);
        await this.installDependencies(project.projectId, frontendPath);
      } catch (error) {
        console.error(
          `[${projectId}] Failed to install frontend dependencies, but continuing...`,
          error,
        );
      }
    } else {
      console.log(
        `[${projectId}] Frontend dependencies already installed, skipping`,
      );
    }

    if (!backendExists) {
      try {
        console.log(`Installing backend dependencies...`);
        await this.installDependencies(project.projectId, backendPath);
      } catch (error) {
        console.error(
          `[${projectId}] Failed to install backend dependencies, but continuing...`,
          error,
        );
      }
    } else {
      console.log(
        `[${projectId}] Backend dependencies already installed, skipping`,
      );
    }

    console.log(`Starting backend on port ${project.backendPort}...`);
    const backendProcess = this.startBackend(
      project.projectId,
      backendPath,
      project.backendPort!,
    );

    // Wait a bit for backend to start
    await this.sleep(3000);

    console.log(`Starting frontend on port ${project.frontendPort}...`);
    const frontendProcess = this.startFrontend(
      project.projectId,
      frontendPath,
      project.frontendPort!,
    );

    this.processes.set(project.projectId, [backendProcess, frontendProcess]);

    // Wait for frontend to be ready
    console.log(`Waiting for frontend to be ready...`);
    await this.waitForServer(project.frontendPort!, 30000); // Wait up to 30 seconds

    console.log(`Project ${projectId} started successfully`);
    return {
      projectId: project.projectId,
      status: 'running',
      frontendUrl: `http://localhost:${project.frontendPort}`,
      backendUrl: `http://localhost:${project.backendPort}`,
    };
  }
  ////////Start Backend///////////
  private startBackend(
    projectId: string,
    backendPath: string,
    port: number,
  ): ChildProcess {
    console.log(`Starting backend for ${projectId} on port ${port}`);
    console.log(`Backend path: ${backendPath}`);

    const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

    const child = spawn(npmCommand, ['run', 'start'], {
      cwd: backendPath,
      shell: true,
      stdio: 'pipe',
      env: {
        ...process.env,
        PORT: port.toString(),
      },
    });

    child.stdout?.on('data', (data) => {
      console.log(`[${projectId} BACKEND] ${data.toString().trim()}`);
    });

    child.stderr?.on('data', (data) => {
      console.error(`[${projectId} BACKEND ERROR] ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      console.log(`[${projectId} BACKEND] process exited with code ${code}`);
    });

    child.on('error', (error) => {
      console.error(`[${projectId} BACKEND] Failed to start process:`, error);
    });

    return child;
  }
  ////////////////////Start Frontend///////
  private startFrontend(
    projectId: string,
    frontendPath: string,
    port: number,
  ): ChildProcess {
    console.log(`Starting frontend for ${projectId} on port ${port}`);
    console.log(`Frontend path: ${frontendPath}`);

    const child = spawn(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['start', '--', '--port', port.toString()],
      {
        cwd: frontendPath,
        shell: process.platform === 'win32' ? 'cmd.exe' : false,
        stdio: 'pipe',
      },
    );

    child.stdout?.on('data', (data) => {
      console.log(`[${projectId} FRONTEND] ${data.toString().trim()}`);
    });

    child.stderr?.on('data', (data) => {
      console.error(`[${projectId} FRONTEND ERROR] ${data.toString().trim()}`);
    });

    child.on('close', (code) => {
      console.log(`[${projectId} FRONTEND] process exited with code ${code}`);
    });

    child.on('error', (error) => {
      console.error(`[${projectId} FRONTEND] Failed to start process:`, error);
    });

    return child;
  }
  ////////////install dependency////////////
  private installDependencies(
    projectId: string,
    projectPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`[${projectId}] Installing dependencies in ${projectPath}`);

      const child = spawn(
        process.platform === 'win32' ? 'npm.cmd' : 'npm',
        ['install'],
        {
          cwd: projectPath,
          shell: process.platform === 'win32' ? 'cmd.exe' : false,
          stdio: 'pipe',
        },
      );

      child.stdout?.on('data', (data) => {
        console.log(`[${projectId} NPM] ${data}`);
      });

      child.stderr?.on('data', (data) => {
        console.error(`[${projectId} NPM ERROR] ${data}`);
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(`[${projectId}] Dependencies installed successfully`);
          resolve();
        } else {
          reject(
            new Error(`npm install failed for ${projectId} with code ${code}`),
          );
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  private async directoryExists(dirPath: string): Promise<boolean> {
    try {
      await fs.access(dirPath);
      return true;
    } catch {
      return false;
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async waitForServer(port: number, timeout: number): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        const isReady = await this.checkPort(port);
        if (isReady) {
          console.log(`Server on port ${port} is ready`);
          // Additional wait to ensure Angular dev server is fully ready
          await this.sleep(5000);
          return;
        }
      } catch (error) {
        // Server not ready yet, wait and retry
        console.log(`Waiting for server on port ${port}...`);
        await this.sleep(3000);
      }
    }
    
    console.warn(`Server on port ${port} did not become ready within ${timeout}ms, but continuing...`);
  }

  private checkPort(port: number): Promise<boolean> {
    return new Promise((resolve) => {
      const client = new net.Socket();
      
      client.once('connect', () => {
        client.destroy();
        resolve(true);
      });
      
      client.once('error', () => {
        resolve(false);
      });
      
      client.once('timeout', () => {
        client.destroy();
        resolve(false);
      });
      
      client.connect(port, 'localhost');
      client.setTimeout(2000);
    });
  }

  ////////////////Stop project//////////
  async stopProject(projectId: string) {
    const project = await this.projectsService.getProject(projectId);

    if (!project) {
      throw new NotFoundException(`Project ${projectId} not found`);
    }

    console.log(`Stopping project: ${project.projectId}`);

    const processes = this.processes.get(project.projectId);

    if (processes) {
      for (const process of processes) {
        try {
          console.log(`Killing process ${process.pid} for ${projectId}`);
          process.kill();
        } catch (error) {
          console.error(`Failed to kill process for ${projectId}:`, error);
        }
      }
      this.processes.delete(project.projectId);
    }

    return {
      projectId: project.projectId,
      status: 'stopped',
    };
  }
}
