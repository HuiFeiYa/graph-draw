import { Controller, Get } from '@nestjs/common';
import { MainService } from './main.service';


@Controller('users')
export class MainController {
  constructor(private readonly mainService: MainService) {}

  @Get()
  async getProject() {
    return await this.mainService.getProject();
  }
}