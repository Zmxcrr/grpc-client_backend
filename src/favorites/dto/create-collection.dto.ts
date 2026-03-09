import { IsString } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class CreateCollectionDto {
  @ApiProperty({ example: 'My Collection' })
  @Field()
  @IsString()
  name: string;
}
