import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/services/users.service';
import { User } from 'src/users';
// import { contentSecurityPolicy } from 'helmet';
type TokenResponse = {
  token_type: string;
  access_token: string;
};

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(payload: User) {
    console.log('register', payload);
    const user = await this.usersService.findOne(payload.email);

    if (user) {
      throw new BadRequestException('User with such email already exists');
    }

    if (!payload.email || !payload.password) {
      throw new BadRequestException('Email and password are required');
    }

    const { id: userId } = await this.usersService.createOne(payload as any);
    return { userId };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.usersService.findOne(email);

    if (user) {
      return user;
    }

    return this.usersService.createOne({ email, password });
  }

  login(user: User, type: 'jwt' | 'basic' | 'default'): TokenResponse {
    const LOGIN_MAP = {
      jwt: this.loginJWT,
      basic: this.loginBasic,
      default: this.loginJWT,
    };
    const login = LOGIN_MAP[type];
    console.log('login', user, type);

    return login ? login(user) : LOGIN_MAP.default(user);
  }

  loginJWT(user: User) {
    const payload = { email: user.email, sub: user.id };

    return {
      token_type: 'Bearer',
      access_token: this.jwtService.sign(payload),
    };
  }

  loginBasic(user: User) {
    // const payload = { email: user.email, sub: user.id };
    console.log('user', user);

    function encodeUserToken(user: User) {
      const { email, password } = user;
      const buf = Buffer.from([email, password].join(':'), 'utf8');

      return buf.toString('base64');
    }

    return {
      token_type: 'Basic',
      access_token: encodeUserToken(user),
    };
  }
}
