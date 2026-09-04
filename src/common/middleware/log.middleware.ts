import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { lifecycleLog } from '../lifecycle-log.js';

/**
 * 中间件：请求链路最早一层，路由匹配前就会执行。
 * 只做预处理（日志），不做鉴权、不做参数校验。
 */
@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, _res: Response, next: NextFunction) {
    lifecycleLog('中间件', `${req.method} ${req.originalUrl}`);
    next();
  }
}
