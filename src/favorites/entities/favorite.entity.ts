import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  Unique,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '../../users/entities/user.entity';
import { FavoriteCollection } from './favorite-collection.entity';

@ObjectType()
@Entity('favorites')
@Unique(['userId', 'itemId'])
export class Favorite {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  itemId: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Field({ nullable: true })
  @Column({ nullable: true })
  collectionId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => FavoriteCollection, (col) => col.favorites, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'collectionId' })
  collection: FavoriteCollection;
}
