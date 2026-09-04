import { Injectable } from '@nestjs/common';

/**
 * 共享模块中的服务：默认单例，谁 imports SharedModule 都拿到同一份实例。
 * 教学用内存自增 id，不连数据库。
 */
@Injectable()
export class IdGeneratorService {
  private seq = 2;

  next(): number {
    this.seq += 1;
    return this.seq;
  }
}
