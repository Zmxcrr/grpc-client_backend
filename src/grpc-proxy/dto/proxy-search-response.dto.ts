import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class SearchResultItem {
  @ApiProperty()
  @Field()
  id: string;

  @ApiProperty()
  @Field()
  title: string;

  @ApiProperty()
  @Field()
  description: string;

  @ApiProperty()
  @Field(() => Float)
  score: number;
}

@ObjectType()
export class ProxySearchResponse {
  @ApiProperty({ type: [SearchResultItem] })
  @Field(() => [SearchResultItem])
  results: SearchResultItem[];

  @ApiProperty()
  @Field(() => Int)
  total: number;
}
