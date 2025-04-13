import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CartStatuses } from '../models';
import { Cart } from '../cart.entity';
import { CartItem } from '../cartItem.entity';
import { PutCartPayload } from 'src/order/type';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private carts: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItems: Repository<CartItem>,
  ) {}

  async findById(id: string): Promise<Cart> {
    return await this.carts.findOne({
      where: { id },
      relations: ['items'],
    });
  }

  async findByUserId(user_id: string): Promise<Cart> {
    return await this.carts.findOne({
      where: { user: { id: user_id } },
      relations: ['items'],
    });
  }

  async createByUserId(user_id: string): Promise<Cart> {
    const timestamp = new Date();

    const cart = this.carts.create({
      id: randomUUID(),
      user: { id: user_id },
      status: CartStatuses.OPEN,
      created_at: timestamp,
      updated_at: timestamp,
      items: [],
    });

    return await this.carts.save(cart);
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const cart = await this.findByUserId(userId);

    if (cart) {
      return cart;
    }

    return await this.createByUserId(userId);
  }

  async updateByUserId(userId: string, payload: PutCartPayload): Promise<Cart> {
    console.log('updateByUserId', userId, payload);
    const cart = await this.findOrCreateByUserId(userId);
    console.log('updateByUserId cart', cart);

    const index = cart.items.findIndex(
      (item) => item.product_id === payload.product.id,
    );

    if (index === -1) {
      const cartItem = this.cartItems.create({
        product_id: payload.product.id || randomUUID(),
        count: payload.count,
        cart_id: cart.id,
      });
      cart.items.push(cartItem);
      await this.cartItems.save(cartItem);
    } else if (payload.count === 0) {
      await this.cartItems.delete({
        cart: { id: cart.id },
        product_id: payload.product.id,
      });
      cart.items.splice(index, 1);
    } else {
      cart.items[index].count = payload.count;
      await this.cartItems.save(cart.items[index]);
    }

    return await this.carts.save(cart);
  }

  async removeByUserId(userId: string): Promise<void> {
    const cart = await this.findByUserId(userId);
    if (!cart) return;

    await this.cartItems.delete({ cart_id: cart.id });
    await this.carts.delete({ user: { id: userId } });
  }
}
