import { Injectable } from '@nestjs/common';

/** 全局模块中的服务：全项目可直接注入，无需 imports */
@Injectable()
export class AppLoggerService {
  log(message: string) {
    console.log(`[AppLogger] ${new Date().toISOString()} ${message}`);
  }
}
