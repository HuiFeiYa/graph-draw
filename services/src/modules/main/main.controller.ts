import { Body, Controller, Get, Post } from '@nestjs/common';
import { MainService } from './main.service';
import { ResData } from 'src/utils/http/ResData';


@Controller('mainProject')
export class MainController {
  constructor(private readonly mainService: MainService) {}

  @Get()
  async getProject() {
    return await this.mainService.getProject();
  }
  @Post()
  async createProject(@Body() dto) {
    await this.mainService.createProject(dto);
    return new ResData();
  }
}