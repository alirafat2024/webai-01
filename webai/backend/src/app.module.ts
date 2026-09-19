import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { AiModule } from './ai/ai/ai.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from './projects/projects.module.js';
import { RunnerModule } from './runner/runner.module.js';
import { CodingModule } from './coding/coding.module.js';
import { GetProjectsModule } from './get-projects/get-projects.module.js';
@Module({
  imports: [ConfigModule.forRoot(), AiModule, ProjectsModule, TypeOrmModule.forRoot({
     type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '1234',
      database: 'webai',
      autoLoadEntities: true,
      synchronize: true,
  }), RunnerModule, CodingModule, GetProjectsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
