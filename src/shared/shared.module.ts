import { Module } from '@nestjs/common';
import { IdGeneratorService } from './id-generator.service.js';

/**
 * 共享模块：必须 exports 出去，其他模块 imports 后才能注入。
 * 和 @Global() 的区别：依赖关系是显式的，谁在用一目了然。
 */
@Module({
  providers: [IdGeneratorService],
  exports: [IdGeneratorService],
})
export class SharedModule {}
