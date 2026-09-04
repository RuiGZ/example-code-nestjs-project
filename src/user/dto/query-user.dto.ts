import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class QueryUserDto {
  @IsOptional()
  @Type(() => Number)
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
