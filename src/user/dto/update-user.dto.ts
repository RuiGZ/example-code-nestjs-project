import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto.js';

/** 修改时所有字段可选，校验规则复用 CreateUserDto */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
