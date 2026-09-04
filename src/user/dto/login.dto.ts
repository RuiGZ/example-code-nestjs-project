import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  name: string;
}
