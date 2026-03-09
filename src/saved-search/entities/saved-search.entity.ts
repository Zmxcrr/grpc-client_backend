import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity('saved_searches')
export class SavedSearch {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  userId: string;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  query: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  filters: Record<string, any>;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.savedSearches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
