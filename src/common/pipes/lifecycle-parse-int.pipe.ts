import { ArgumentMetadata, Injectable, ParseIntPipe, PipeTransform } from '@nestjs/common';
import { lifecycleLog } from '../lifecycle-log.js';

/**
 * 不要直接 extends ParseIntPipe：父类 constructor(options?) 会被 Nest 当成注入依赖而启动失败。
 * 组合官方管道即可，@Param('id', LifecycleParseIntPipe) 才能被正确实例化。
 */
@Injectable()
export class LifecycleParseIntPipe implements PipeTransform {
  private readonly parseIntPipe = new ParseIntPipe();

  async transform(value: unknown, metadata: ArgumentMetadata) {
    lifecycleLog('管道', `ParseIntPipe @${metadata.data ?? ''} ← ${String(value)}`);
    return this.parseIntPipe.transform(value, metadata);
  }
}
