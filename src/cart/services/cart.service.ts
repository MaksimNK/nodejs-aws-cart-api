import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartStatuses } from '../models/cart.entity';
import { CartItem } from '../models/cart-item.entity';
import { PutCartPayload } from 'src/order/type';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(CartItem)
    private cartItemRepository: Repository<CartItem>,
  ) {}

  async findOrCreateByUserId(user_id: string): Promise<Cart> {
    let cart = await this.cartRepository.findOne({
      where: { user_id, status: CartStatuses.OPEN },
      relations: ['items'],
    });

    if (!cart) {
      cart = this.cartRepository.create({ user_id });
      cart = await this.cartRepository.save(cart);
    }

    return cart;
  }

  async updateItem(user_id: string, payload: PutCartPayload): Promise<Cart> {
    const cart = await this.findOrCreateByUserId(user_id);

    let item = await this.cartItemRepository.findOne({
      where: { cart: { id: cart.id }, product_id: payload.product.id },
      relations: ['cart'],
    });

    if (!item && payload.count > 0) {
      item = this.cartItemRepository.create({
        cart,
        product_id: payload.product.id,
        count: payload.count,
      });
      await this.cartItemRepository.save(item);
    } else if (item && payload.count === 0) {
      await this.cartItemRepository.remove(item);
    } else if (item) {
      item.count = payload.count;
      await this.cartItemRepository.save(item);
    }

    return await this.cartRepository.findOne({
      where: { id: cart.id },
      relations: ['items'],
    });
  }

  async clearCart(user_id: string): Promise<void> {
    const cart = await this.findOrCreateByUserId(user_id);
    await this.cartItemRepository.delete({ cart: { id: cart.id } });
  }

  async findByUserId(user_id: string): Promise<Cart | undefined> {
    return this.cartRepository.findOne({
      where: { user_id, status: CartStatuses.OPEN },
      relations: ['items'],
    });
  }
}
