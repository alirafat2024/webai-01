import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
@Injectable()
export class AppService {
  constructor(private dataSource: DataSource) {}
  getHello(): string {
    return 'Hello World my name is ali jan qand !';

  }

    async checkDatabase() {
    try {
      await this.dataSource.query('SELECT 1');

      return {
        connected: true,
        message: 'Database connected successfully!',
      };
    } catch (error) {
      return {
        connected: false,
        message: 'Database connection failed!',
        error: (error as Error).message,
      };
    }
  }
}

