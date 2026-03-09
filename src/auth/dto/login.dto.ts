import { IsEmail, IsString } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @Field()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword123' })
  @Field()
  @IsString()
  password: string;
}
