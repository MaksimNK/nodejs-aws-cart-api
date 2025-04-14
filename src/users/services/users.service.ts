import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { User } from '../user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findOne(email: string): Promise<User> {
    return this.users.findOne({ where: { email } });
  }

  async createOne({
    email,
    password,
  }: Omit<User, 'created_at' | 'updated_at' | 'id' | 'carts'>): Promise<User> {
    console.log('createOne', email, password);
    const newUser = this.users.create({
      id: randomUUID(),
      email,
      password,
      created_at: new Date(),
      updated_at: new Date(),
    });
    return await this.users.save(newUser);
  }
}
