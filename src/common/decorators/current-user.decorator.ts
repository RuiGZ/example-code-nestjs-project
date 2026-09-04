import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * 自定义参数装饰器：从 request.user 取出当前登录用户。
 * 依赖 LoginGuard 先把用户挂到 req.user。
 */
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);
