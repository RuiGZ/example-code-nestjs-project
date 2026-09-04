import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { LoginGuard } from '../common/guards/login.guard.js';
import { lifecycleLog } from '../common/lifecycle-log.js';
import { LifecycleParseIntPipe } from '../common/pipes/lifecycle-parse-int.pipe.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { UserService } from './user.service.js';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /** POST /user/login —— 公开：任意用户名换 token */
  @Post('login')
  login(@Body() dto: LoginDto) {
    lifecycleLog('控制器', 'UserController.login');
    return this.userService.login(dto);
  }

  /** GET /user/profile —— 需登录；必须写在 :id 前面，避免被当成 id */
  @Get('profile')
  @UseGuards(LoginGuard)
  getProfile(@CurrentUser() user: User) {
    lifecycleLog('控制器', 'UserController.getProfile');
    return user;
  }

  /** GET /user?page=1&size=10&keyword=前端 —— 公开 */
  @Get()
  findAll(@Query() query: QueryUserDto) {
    lifecycleLog('控制器', 'UserController.findAll');
    return this.userService.findAll(query);
  }

  /** GET /user/:id —— 公开 */
  @Get(':id')
  findOne(@Param('id', LifecycleParseIntPipe) id: number) {
    lifecycleLog('控制器', 'UserController.findOne');
    return this.userService.findOne(id);
  }

  /** POST /user —— 需登录 */
  @Post()
  @UseGuards(LoginGuard)
  create(@Body() dto: CreateUserDto) {
    lifecycleLog('控制器', 'UserController.create');
    return this.userService.create(dto);
  }

  /** PATCH /user/:id —— 需登录 */
  @Patch(':id')
  @UseGuards(LoginGuard)
  update(@Param('id', LifecycleParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    lifecycleLog('控制器', 'UserController.update');
    return this.userService.update(id, dto);
  }

  /** DELETE /user/:id —— 需登录 */
  @Delete(':id')
  @UseGuards(LoginGuard)
  remove(@Param('id', LifecycleParseIntPipe) id: number) {
    lifecycleLog('控制器', 'UserController.remove');
    return this.userService.remove(id);
  }
}
