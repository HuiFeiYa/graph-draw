import { Injectable } from '@nestjs/common';

@Injectable()
export class ProjectService {
  openProject_New(): string {
    return 'Hello World!';
  }
}
