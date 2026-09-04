import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { lifecycleLog } from '../lifecycle-log.js';

/** 全局守卫：永远放行，只为让每条请求都打出「守卫」这一环 */
@Injectable()
export class LifecycleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    lifecycleLog('守卫', `${req.method} ${req.url}（LifecycleGuard 放行）`);
    return true;
  }
}
