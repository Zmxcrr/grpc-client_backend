import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GraphQLJSON } from 'graphql-type-json';
import { User } from '../../users/entities/user.entity';

@ObjectType()
@Entity('grpc_call_logs')
export class GrpcCallLog {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  userId: string;

  @Field()
  @Column()
  service: string;

  @Field()
  @Column()
  method: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @Column({ type: 'jsonb', nullable: true })
  request: Record<string, any>;

  @Field(() => Int)
  @Column({ type: 'int' })
  durationMs: number;

  @Field()
  @Column()
  status: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  errorMessage: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
