import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Cart } from '../cart/cart.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string; // UUID for the user

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string; // User's email

  @Column({ type: 'varchar', length: 255 })
  password: string; // User's hashed password

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_DATE' })
  created_at: Date; // Timestamp for creation

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_DATE' })
  updated_at: Date; // Timestamp for the last update

  @OneToMany(() => Cart, (cart) => cart.user, { cascade: true })
  carts: Cart[]; // One-to-many relationship with Cart entity
}
