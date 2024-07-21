import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    Logger.log(`Check env variables: ${process.env.SOMETHING}`);
    Logger.log(`Check env variables: ${process.env.ENV_TEST}`);
    return this.appService.getHello();
  }
}
