import { IsString, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class ProxySearchDto {
  @ApiProperty({ example: 'search query' })
  @Field()
  @IsString()
  query: string;

  @ApiProperty({ required: false, example: { category: 'news' } })
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  filters?: Record<string, any>;
}
