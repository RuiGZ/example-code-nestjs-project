import { Global, Module } from '@nestjs/common';
import { AppLoggerService } from './logger.service.js';

/**
 * 全局模块：AppModule 导入一次后，任意模块都能注入 AppLoggerService。
 * 文档提醒：仅适合日志、配置这类真正全局的能力，业务模块不要滥用 @Global()。
 */
@Global()
@Module({
  providers: [AppLoggerService],
  exports: [AppLoggerService],
})
export class LoggerModule {}
