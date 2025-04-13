import { Module } from '@nestjs/common';

import { OrderModule } from '../order/order.module';

import { CartController } from './cart.controller';
import { CartService } from './services';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './cart.entity';
import { CartItem } from './cartItem.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [OrderModule, TypeOrmModule.forFeature([Cart, User, CartItem])],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}
