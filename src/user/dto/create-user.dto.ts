import { IsInt, IsNotEmpty, IsString, Max, Min, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  @MinLength(2, { message: '用户名至少 2 个字符' })
  name: string;

  @IsNotEmpty({ message: '年龄不能为空' })
  @IsInt({ message: '年龄必须是整数' })
  @Min(1, { message: '年龄至少为 1' })
  @Max(150, { message: '年龄不能超过 150' })
  age: number;
}
