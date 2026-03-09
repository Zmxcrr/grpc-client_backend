import { IsString, IsOptional, IsUUID } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class AddFavoriteDto {
  @ApiProperty({ example: 'item-123' })
  @Field()
  @IsString()
  itemId: string;

  @ApiProperty({ required: false })
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  payload?: Record<string, any>;

  @ApiProperty({ required: false })
  @Field({ nullable: true })
  @IsOptional()
  @IsUUID()
  collectionId?: string;
}
