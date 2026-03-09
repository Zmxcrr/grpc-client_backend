import { IsEmail, IsString, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @Field()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'strongpassword123' })
  @Field()
  @IsString()
  @MinLength(6)
  password: string;
}
