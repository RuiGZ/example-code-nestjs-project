import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { lifecycleLog } from '../lifecycle-log.js';

/**
 * 异常过滤器：控制器 / 服务 / 管道 / 守卫抛出的 HttpException 都在这里兜底。
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();
    lifecycleLog('异常过滤器', `${status} ${this.extractMessage(payload)}`);

    res.status(status).json({
      code: status,
      message: this.extractMessage(payload),
      data: null,
    });
  }

  private extractMessage(payload: string | object): string {
    if (typeof payload === 'string') {
      return payload;
    }

    const message = (payload as { message?: string | string[] }).message;
    if (Array.isArray(message)) {
      return message.join('; ');
    }
    return message ?? '请求失败';
  }
}
