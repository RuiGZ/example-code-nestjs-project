import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { map } from 'rxjs/operators';
import { lifecycleLog } from '../lifecycle-log.js';

/**
 * 拦截器：控制器执行前后都能切入。这里做后置处理，统一成功响应格式。
 */
@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    lifecycleLog('拦截器-前置', `${req.method} ${req.url}`);

    return next.handle().pipe(
      tap(() => lifecycleLog('拦截器-后置', '控制器/服务已返回，开始包装响应')),
      map((data) => ({
        code: 200,
        data,
        message: '请求成功',
      })),
    );
  }
}
