## 一、NestJS 整体架构与核心设计思想
### 1.1 框架定位
NestJS 是一款**基于 Node****.****js、面向企业级、TS 优先**的后端开发框架。

和 Express/Koa 最大区别：**强架构、强分层、依赖注入、工程化约束极强**，天然适合团队协作、中大型项目，对于前端转全栈学习压力较小的框架。

### 1.2 核心设计理念
+ **分层解耦**：路由、参数、逻辑、权限、异常层层拆分，各司其职
+ **依赖注入 DI**：无需手动实例化，自动管理依赖
+ **模块化**：业务隔离、可复用、低耦合
+ **切面编程 AOP**：通过中间件、守卫、拦截器、过滤器统一处理通用逻辑

### 1.3 官方标准请求生命周期
<img src="https://cdn.nlark.com/yuque/__mermaid_v3/dd6ea0dc711ab33689c9b5c96f7c39fb.svg" width="1300" title="" crop="0,0,1,1" id="uDKbW" class="ne-image">

---

## 二、九大核心组件 逐节精讲（概念+场景+代码）
### 2.1 Module 模块 —— 架构基石
#### 核心概念
Module 是 NestJS 的最小业务单元，用于**拆分业务、隔离代码、管理依赖、实现复用**。整个应用由无数模块拼接而成，根模块为 AppModule。

每个模块独立封闭，默认无法互相访问，需手动导出导入。

#### 模块三大类型与实战特性
##### 1）普通业务模块
用于拆分核心业务：用户模块、文章模块、订单模块，各司其职。

##### 2）共享模块
核心特性：**默认单例模式、节省内存、跨组件共享服务能力**

场景：多个模块需要复用同一服务（如工具服务、字典服务、公共配置服务）

核心原理：被共享的 Service 全局只会初始化**一次**，所有引入该模块的业务模块，共用同一个实例，避免重复实例化造成内存冗余，同时支持跨模块共享工具方法、配置信息等通用能力。

##### 3）全局模块
通过 **@Global****(****)** 装饰器修饰普通模块，即可声明为全局模块。一旦注册生效，**全项目所有业务模块无需手动 imports 导入，可直接注入使用其内部服务**。

✅ 适用场景：全局工具、全局配置、日志服务

❌ 严格慎用、禁止滥用：全局模块会隐式注入全项目，极易造成**依赖关系不透明、代码溯源困难、模块耦合严重、状态污染**等问题，中大型团队项目中仅允许全局日志、全局配置类模块使用。

#### 模块标准代码示例
```typescript
import { Module, Global } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';

// @Global() // 开启全局模块（谨慎使用）
@Module({
  controllers: [UserController], // 注册当前模块控制器
  providers: [UserService],       // 注册当前模块服务
  exports: [UserService]          // 导出服务，供其他模块共享调用
})
export class UserModule {}
```

#### 模块核心四字段总结
+ controllers：当前模块的路由控制器
+ providers：当前模块的服务、工具类
+ imports：导入其他模块，使用其导出的服务
+ exports：对外暴露服务，供其他模块复用

---

### 2.2 Controller 控制器 —— 请求入口
#### 核心概念
Controller 职责**单一且纯粹**：**接收 HTTP 请求、定义路由、接收参数、调用服务、返回响应**。

官方建议：**控制器****不****写业务逻辑**，只做请求转发，所有逻辑下沉到 Service。

#### 常用请求装饰器
@Get / @Post / @Put / @Delete / @Patch

#### 三种参数接收方式
+ @Param：路径动态参数（如 /user/1001）
+ @Query：url 拼接参数（分页、筛选）
+ @Body：请求体参数（新增、修改）

#### 完整示例代码
```typescript
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { AddUserDto } from './dto/add-user.dto';

@Controller('user') // 统一路由前缀 /user
export class UserController {
  // 依赖注入：自动引入服务，无需 new 实例
  constructor(private readonly userService: UserService) {}

  // GET 查询列表
  @Get('list')
  getList(@Query() query: { page: number; size: number }) {
    return this.userService.getList(query);
  }

  // GET 查询详情
  @Get('info/:id')
  getInfo(@Param('id') id: string) {
    return this.userService.getInfo(+id);
  }

  // POST 新增用户
  @Post('add')
  addUser(@Body() dto: AddUserDto) {
    return this.userService.addUser(dto);
  }
}
```

---

### 2.3 Providers 提供者 —— 业务核心
#### 核心概念
Provider 是 NestJS **所有可注入对象的顶层统称**，是依赖注入体系的核心载体。我们日常开发用到的 **Service 服务，只是 Provider 最常用的一种**（除此之外还有 Repository、Factory、Helper 等可注入对象）。

核心特性：所有 Provider **默认全局单例模式**，应用启动后仅实例化一次，全局共享同一个实例，有效减少内存开销；同时需重点注意**单例状态污染、并发数据错乱**等生产坑点。

核心职责：承接控制器转发的请求，统一处理**所有核心业务逻辑、参数二次处理、数据库CRUD、接口联调、复杂计算**，是项目的业务核心层。

#### 核心装饰器
@Injectable()：标记当前类为可注入服务，交由 Nest 容器管理

#### 示例代码
```typescript
import { Injectable } from '@nestjs/common';
import { AddUserDto } from './dto/add-user.dto';

@Injectable()
export class UserService {
  // 模拟数据库用户数据
  private userList = [{ id: 1, name: '前端开发者', age: 25 }];

  // 查询列表
  getList(query: { page: number; size: number }) {
    const { page = 1, size = 10 } = query;
    return {
      list: this.userList,
      total: this.userList.length,
      page,
      size
    };
  }

  // 查询详情
  getInfo(id: number) {
    return this.userList.find(item => item.id === id);
  }

  // 新增用户
  addUser(dto: AddUserDto) {
    const newUser = { id: Date.now(), ...dto };
    this.userList.push(newUser);
    return { message: '新增成功', data: newUser };
  }
}
```

---

### 2.4 Middleware 中间件 —— 请求最早拦截层
#### 核心概念
中间件是**基于 Express 原生生命周期的最前置拦截层**，不归属 Nest 内核AOP体系。在路由匹配、Nest 内核逻辑执行前优先触发，是整个请求链路的第一道处理关卡。

核心职责：仅做**请求预处理、通用统一操作**，无权限校验、无参数校验、无业务处理能力。常用场景：全局请求日志打印、跨域预处理、请求头统一挂载、接口白名单过滤。

#### 两种声明方式
##### 1）函数式中间件（简单场景）
```typescript
import { Request, Response, NextFunction } from 'express';

export function LoggerMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log('请求地址：', req.url);
  console.log('请求方式：', req.method);
  next();
}
```

##### 2）类式中间件（可复用、可注入）
```typescript
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('【全局请求日志】', req.url, new Date());
    next();
  }
}
```

#### 模块中注册中间件
```typescript
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { LogMiddleware } from './middleware/log.middleware';

@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // 全局所有路由生效
    consumer.apply(LogMiddleware).forRoutes('*');
  }
}
```

#### 适用场景
请求日志、跨域处理、请求头统一处理、白名单过滤

---

### 2.5 Guards 守卫 —— 权限校验层
#### 核心概念
守卫是**Nest 内核专属AOP层级**，严格执行在中间件之后、路由匹配与控制器执行之前，是 Nest 权限体系的核心组件。

核心作用：**精准鉴权、权限拦截**，通过返回布尔值控制请求放行/拦截：true 放行进入后续逻辑，false 直接抛出403无权限异常，终止请求。专门用于登录态校验、接口权限控制、角色权限区分。

#### 核心区别：中间件 vs 守卫
+ **中间件（Express原生）**：无Nest上下文、**不支持依赖注入DI、无法读取自定义装饰器元数据**，只能做全局通用预处理，无法实现精细化、差异化权限控制
+ **守卫（Nest内核AOP）**：拥有完整Nest上下文、**完美支持DI依赖注入、可读取接口装饰器元数据**，能实现接口级、角色级的精细化权限管控，是权限校验的规范方案

#### 守卫示例（简易登录校验）
```typescript
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class LoginGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = req.headers.token;

    // 无 token 拒绝访问
    if (!token) return false;
    return true;
  }
}
```

#### 接口单独使用守卫
```typescript
@Get('list')
@UseGuards(LoginGuard)
getList() {
  // ...
}
```

---

### 2.6 Pipes 管道 —— 校验与转换层
#### 核心两大能力
+ **数据校验（核心）**：基于 class-validator 校验规则，自动校验前端入参：非空、数据类型、字符长度、数值范围、格式合法性
+ **数据转换**：自动清洗、格式化参数，如字符串转数字、去除首尾空格、自动兜底默认值等

企业开发标配：**所有接口入参必须通过 Pipe+DTO 统一校验**，彻底替代手写大量if判断校验，杜绝脏数据、非法参数进入业务逻辑，保证接口稳定性。

#### 依赖安装
```bash
npm i class-validator class-transformer
```

#### DTO 校验示例
```typescript
import { IsString, IsNumber, MinLength, IsNotEmpty } from 'class-validator';

export class AddUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MinLength(2, { message: '用户名至少2个字符' })
  name: string;

  @IsNotEmpty({ message: '年龄不能为空' })
  @IsNumber()
  age: number;
}
```

#### 数据转换示例
Query / Path 传来的全是字符串。`GET /user?page=1` 里 `page` 实际是 `"1"`，不先转成数字，后面的 `@IsInt()` 会直接失败。用 class-transformer 的 `@Type` 声明目标类型，并在管道里打开 `transform: true`。

```typescript
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryUserDto {
  @IsOptional()
  @Type(() => Number) // "1" → 1，再交给 @IsInt 校验
  @IsInt({ message: 'page 必须是整数' })
  @Min(1, { message: 'page 至少为 1' })
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'size 必须是整数' })
  @Min(1, { message: 'size 至少为 1' })
  size?: number;

  @IsOptional()
  @IsString()
  keyword?: string;
}
```

需要清洗、兜底时再用 `@Transform`，例如去空格、空值转默认值：

```typescript
import { Transform, Type } from 'class-transformer';

@Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
@IsString()
keyword?: string;

@Type(() => Number)
@Transform(({ value }) => value === undefined || value === '' ? 1 : Number(value))
page?: number;
```

#### 全局开启管道（main.ts）
```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // whitelist：丢掉 DTO 未声明字段；transform：按 @Type / @Transform 做类型转换
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(3000);
}
```

---

### 2.7 Interceptors 拦截器 —— 切面统一处理
#### 核心概念
拦截器属于 Nest 核心AOP切面组件，**在控制器执行前、执行后双向触发**，基于RxJS响应式流处理，用于抽离所有接口的通用后置、前置统一逻辑。

#### 核心场景
+ 统一接口返回格式（固定 {code,data,msg}）
+ 接口响应耗时统计
+ 统一数据格式化
+ 全局日志记录

#### 统一响应拦截器示例
```typescript
import { CallHandler, ExecutionContext, NestInterceptor, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => {
        // 统一返回格式
        return {
          code: 200,
          data,
          message: '请求成功'
        };
      })
    );
  }
}
```

---

### 2.8 Exception Filters 异常过滤器 —— 全局兜底
#### 核心概念
全局异常过滤器是项目**统一报错兜底组件**，可捕获全局所有层级异常：控制器报错、服务层报错、数据库异常、主动抛出的业务异常。统一格式化错误响应、收集错误日志、适配服务监控，解决原生报错杂乱、前端无法统一处理的问题。

#### 全局异常过滤器示例
```typescript
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const errMsg = exception.getResponse() as any;

    res.status(status).json({
      code: status,
      message: typeof errMsg === 'string' ? errMsg : errMsg.message,
      data: null
    });
  }
}
```

---

### 2.9 核心组件总结：区别与适用场景
#### 分层职责极简区分
+ **中间件**：最前置预处理（日志、跨域、请求头），无校验、无权限、无业务能力
+ **守卫**：专属权限层，主要负责登录态、角色、接口权限拦截放行
+ **管道**：专属参数层，主要负责入参校验、数据清洗、参数转换
+ **拦截器**：全局切面层，统一处理请求耗时、响应格式、数据格式化、全局日志
+ **异常过滤器**：全局兜底层，捕获所有异常，统一报错格式、日志监控

---

## 三、装饰器体系
### 3.1 常用内置装饰器
模块：@Module、@Global

控制器：@Controller、@Get、@Post、@Put、@Delete

参数：@Param、@Query、@Body

切面：@UseGuards、@UseInterceptors、@UseFilters

服务：@Injectable

### 3.2 自定义装饰器
#### 场景：快速获取当前登录用户信息
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// 自定义参数装饰器：获取当前登录用户
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  },
);

```

#### 使用方式
```typescript
@Get('profile')
getProfile(@CurrentUser() user: any) {
  return user;
}
```

---

## 四、实战案例：用户管理系统完整 CRUD
### 4.1 一键生成 CRUD 模板
```bash
nest g resource user --no-spec
```

自动生成：module / controller / service / dto 全套结构。本项目在脚手架上补了校验、守卫、拦截器、过滤器、三种模块和演示页，路由保持 **REST**（靠 HTTP 方法区分动作，不用 `/user/add` 这种动作风路径）。

### 4.2 目录与三种模块
```plain
src/
  user/                 普通业务模块 UserModule
    user.controller.ts  只收请求、调服务
    user.service.ts     内存 CRUD + 登录
    auth.service.ts     内存 token 签发/校验
    dto/                Pipe 校验用的入参类
  shared/               共享模块：exports IdGeneratorService，UserModule 需 imports
  logger/               全局模块 @Global()：AppLoggerService，业务模块不用再 imports
  common/               中间件 / 守卫 / 管道 / 拦截器 / 过滤器 / @CurrentUser()
  main.ts               全局管道、守卫、拦截器、过滤器、静态页
public/index.html       同域演示页
```

+ **普通模块**：`UserModule`，`imports: [SharedModule]`，自己的 controller / service
+ **共享模块**：`SharedModule` 必须 `exports`，谁用谁 `imports`，依赖关系显式
+ **全局模块**：`LoggerModule` 只适合日志/配置；`UserService` 能直接注入 `AppLoggerService`

内存数组、内存 token 仅供语法演示。Provider 默认单例，生产环境不要在 Service 里存可变业务状态（见第六点避坑）。

### 4.3 REST 接口一览
统一响应：成功 `{ code: 200, data, message }`；失败由过滤器收成 `{ code, message, data: null }`。

| 方法 | 路径 | 登录 | 说明 |
| --- | --- | --- | --- |
| POST | `/user/login` | 否 | 任意用户名换 token（教学假登录，不是 JWT） |
| GET | `/user` | 否 | 列表，`page` / `size` / `keyword` |
| GET | `/user/:id` | 否 | 详情 |
| GET | `/user/profile` | 是 | 当前用户，`@CurrentUser()`；**必须写在 **`:id`** 前面** |
| POST | `/user` | 是 | 新增 |
| PATCH | `/user/:id` | 是 | 修改 |
| DELETE | `/user/:id` | 是 | 删除 |


需登录接口请求头带 `token: <登录返回的 token>`（也支持 `Authorization: Bearer ...`）。预设用户：`前端开发者`、`Nest学习者`。重启服务后内存数据与 token 都会清空。

控制器只转发，逻辑在 Service。写操作加 `@UseGuards(LoginGuard)`：

```typescript
@Get('profile')
@UseGuards(LoginGuard)
getProfile(@CurrentUser() user: User) {
  return user; // 守卫已把用户挂到 req.user
}

@Post()
@UseGuards(LoginGuard)
create(@Body() dto: CreateUserDto) {
  return this.userService.create(dto);
}
```

---

## 五、避坑总结
+ 禁止滥用 @Global 全局模块，避免依赖混乱
+ Provider 默认单例模式，**绝对禁止在服务中定义可变全局变量、存储临时业务状态**，多请求并发场景会出现数据错乱、状态污染等生产级Bug
+ 严格分层：控制器只转发，业务逻辑全在 Service
+ 参数校验必须用 Pipe+DTO，禁止手写大量 if 判断
+ 权限用守卫、日志用中间件、响应统一用拦截器、报错统一用过滤器，各司其职不混用

## 六、总结
NestJS 对前端开发者极度友好，基于 TS 语法、分层清晰、约束规范。本次分享主要介绍九大核心组件的**执行顺序、职责边界、使用场景**，但是企业级后台服务比本次介绍的要复杂更多，比如认证（常见的 <font style="color:rgb(60, 60, 67);">JWT</font>）、数据库连接、缓存、微服务等。同时，在 AI Coding 时代，AI 对于 NestJS 的语法支持也是比较丰富的，大家可以大胆尝试。
