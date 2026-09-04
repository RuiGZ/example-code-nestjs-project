import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { LogMiddleware } from './common/middleware/log.middleware.js';
import { LoggerModule } from './logger/logger.module.js';
import { UserModule } from './user/user.module.js';

@Module({
  imports: [LoggerModule, UserModule],
  controllers: [AppController],
  providers: [AppService, LogMiddleware],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogMiddleware).forRoutes('*');
  }
}
