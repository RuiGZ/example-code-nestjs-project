import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { lifecycleLog } from '../lifecycle-log.js';
import { AuthService } from '../../user/auth.service.js';

/**
 * 守卫：中间件之后、控制器之前。负责鉴权，true 放行 / 抛异常拦截。
 * 文档写法是 `return false`（等价 403）；这里抛 401 并带上提示，方便对照调试。
 */
@Injectable()
export class LoginGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    lifecycleLog('守卫', `${req.method} ${req.url}（LoginGuard 登录校验）`);
    const raw = req.headers.token ?? req.headers.authorization;
    const token = this.normalizeToken(raw);

    if (!token) {
      throw new UnauthorizedException(
        '缺少 token，请先调用 POST /user/login，并在请求头携带 token',
      );
    }

    const user = this.authService.verify(token);
    if (!user) {
      throw new UnauthorizedException('token 无效或已失效，请重新登录');
    }

    // 挂到 request，供 @CurrentUser() 读取
    req.user = user;
    return true;
  }

  private normalizeToken(raw: unknown): string {
    if (Array.isArray(raw)) {
      return this.normalizeToken(raw[0]);
    }
    if (typeof raw !== 'string') {
      return '';
    }
    return raw.replace(/^Bearer\s+/i, '').trim();
  }
}
