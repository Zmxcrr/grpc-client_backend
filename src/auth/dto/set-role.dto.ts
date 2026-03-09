import { IsEnum, IsUUID } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../common/enums/role.enum';

@InputType()
export class SetRoleDto {
  @ApiProperty({ example: 'uuid-of-user' })
  @Field()
  @IsUUID()
  userId: string;

  @ApiProperty({ enum: Role, example: Role.PREMIUM })
  @Field(() => Role)
  @IsEnum(Role)
  role: Role;
}
