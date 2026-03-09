import { IsString, IsOptional } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class UpdateCollectionDto {
  @ApiProperty({ example: 'Renamed Collection' })
  @Field({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;
}
