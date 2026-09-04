import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { lifecycleLog } from '../lifecycle-log.js';

/** 在官方 ValidationPipe 外包一层日志，参数校验前能看到「管道」 */
export class LifecycleValidationPipe extends ValidationPipe {
  override async transform(value: unknown, metadata: ArgumentMetadata) {
    const target = metadata.metatype?.name ?? typeof value;
    const key = metadata.data ? ` @${metadata.data}` : '';
    lifecycleLog('管道', `${metadata.type} ${target}${key}`);
    return super.transform(value, metadata);
  }
}
