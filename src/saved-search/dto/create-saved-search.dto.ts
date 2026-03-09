import { IsString, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { GraphQLJSON } from 'graphql-type-json';

@InputType()
export class CreateSavedSearchDto {
  @ApiProperty({ example: 'My Search' })
  @Field()
  @IsString()
  name: string;

  @ApiProperty({ example: 'search query' })
  @Field()
  @IsString()
  query: string;

  @ApiProperty({ required: false })
  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  filters?: Record<string, any>;
}
