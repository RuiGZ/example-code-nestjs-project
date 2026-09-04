import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { lifecycleLog } from '../common/lifecycle-log.js';
import { AppLoggerService } from '../logger/logger.service.js';
import { IdGeneratorService } from '../shared/id-generator.service.js';
import { AuthService } from './auth.service.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { QueryUserDto } from './dto/query-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';

/**
 * Provider / Service：业务逻辑都写在这里，控制器只转发。
 * 内存数组仅用于语法演示。文档也提醒：单例里存可变状态，生产环境会有并发污染风险。
 */
@Injectable()
export class UserService {
  private readonly users: User[] = [
    { id: 1, name: '前端开发者', age: 25 },
    { id: 2, name: 'Nest学习者', age: 28 },
  ];

  constructor(
    private readonly idGenerator: IdGeneratorService,
    private readonly logger: AppLoggerService,
    private readonly authService: AuthService,
  ) {}

  create(dto: CreateUserDto) {
    lifecycleLog('服务', 'UserService.create');
    if (this.users.some((item) => item.name === dto.name)) {
      throw new ConflictException(`用户名 ${dto.name} 已存在`);
    }

    const user: User = {
      id: this.idGenerator.next(),
      name: dto.name,
      age: dto.age,
    };
    this.users.push(user);
    this.logger.log(`新增用户 #${user.id} ${user.name}`);
    return user;
  }

  findAll(query: QueryUserDto) {
    lifecycleLog('服务', 'UserService.findAll');
    const page = query.page ?? 1;
    const size = query.size ?? 10;
    const keyword = query.keyword?.trim();

    const filtered = keyword
      ? this.users.filter((item) => item.name.includes(keyword))
      : this.users;

    const start = (page - 1) * size;
    return {
      list: filtered.slice(start, start + size),
      total: filtered.length,
      page,
      size,
    };
  }

  findOne(id: number) {
    lifecycleLog('服务', 'UserService.findOne');
    return this.mustFind(id);
  }

  findByName(name: string) {
    return this.users.find((item) => item.name === name);
  }

  update(id: number, dto: UpdateUserDto) {
    lifecycleLog('服务', 'UserService.update');
    const user = this.mustFind(id);
    if (dto.name && dto.name !== user.name && this.users.some((item) => item.name === dto.name)) {
      throw new ConflictException(`用户名 ${dto.name} 已存在`);
    }

    Object.assign(user, dto);
    this.logger.log(`修改用户 #${user.id}`);
    return user;
  }

  remove(id: number) {
    lifecycleLog('服务', 'UserService.remove');
    const user = this.mustFind(id);
    this.users.splice(this.users.indexOf(user), 1);
    this.logger.log(`删除用户 #${id}`);
    return user;
  }

  login(dto: LoginDto) {
    lifecycleLog('服务', 'UserService.login');
    const user = this.findByName(dto.name) ?? { id: 0, name: dto.name, age: 0 };
    return this.authService.issueToken(user);
  }

  private mustFind(id: number) {
    const user = this.users.find((item) => item.id === id);
    if (!user) {
      throw new NotFoundException(`用户 #${id} 不存在`);
    }
    return user;
  }
}
