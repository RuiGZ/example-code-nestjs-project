import { Module } from '@nestjs/common';
import { LoginGuard } from '../common/guards/login.guard.js';
import { SharedModule } from '../shared/shared.module.js';
import { AuthService } from './auth.service.js';
import { UserController } from './user.controller.js';
import { UserService } from './user.service.js';

/**
 * 普通业务模块：controllers / providers / imports 各司其职。
 * SharedModule 显式导入后才能用 IdGeneratorService；
 * AppLoggerService 来自全局模块，这里不用再 imports。
 */
@Module({
  imports: [SharedModule],
  controllers: [UserController],
  providers: [UserService, AuthService, LoginGuard],
})
export class UserModule {}
