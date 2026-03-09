import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { GrpcCallLogsService } from './grpc-call-logs.service';
import { RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums/role.enum';

@ApiTags('grpc-call-logs')
@Controller('grpc-call-logs')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(Role.MODERATOR, Role.ADMIN)
@ApiBearerAuth()
export class GrpcCallLogsController {
  constructor(private readonly grpcCallLogsService: GrpcCallLogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get gRPC call logs (MODERATOR/ADMIN)' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('limit') limit?: number) {
    return this.grpcCallLogsService.findAll(limit || 100);
  }
}
