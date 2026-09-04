import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { AppModule } from './app.module.js';
import { HttpExceptionFilter } from './common/filters/http-exception.filter.js';
import { LifecycleGuard } from './common/guards/lifecycle.guard.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
import { LifecycleValidationPipe } from './common/pipes/lifecycle-validation.pipe.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useStaticAssets(join(process.cwd(), 'public'));

  // 生命周期对照：中间件 → 守卫 → 拦截器-前置 → 管道 → 控制器 → 服务 → 拦截器-后置 / 异常过滤器
  // 终端搜 [生命周期] 即可按请求看到上述顺序
  app.enableCors();
  app.useGlobalGuards(new LifecycleGuard());
  app.useGlobalPipes(
    new LifecycleValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
