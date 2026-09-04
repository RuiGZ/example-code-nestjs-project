import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity.js';

/** 教学用内存 token，不签发 JWT */
@Injectable()
export class AuthService {
  private readonly tokens = new Map<string, User>();

  issueToken(user: User) {
    const token = `mock_${user.id}_${Date.now().toString(36)}`;
    this.tokens.set(token, user);
    return { token, user };
  }

  verify(token: string): User | undefined {
    return this.tokens.get(token);
  }
}
