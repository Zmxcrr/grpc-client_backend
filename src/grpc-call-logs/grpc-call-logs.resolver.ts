import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GrpcCallLogsService } from './grpc-call-logs.service';
import { GrpcCallLog } from './entities/grpc-call-log.entity';
import { GqlAuthGuard, RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums/role.enum';

@Resolver(() => GrpcCallLog)
export class GrpcCallLogsResolver {
  constructor(private readonly grpcCallLogsService: GrpcCallLogsService) {}

  @Query(() => [GrpcCallLog])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  async grpcCallLogs(
    @Args('limit', { type: () => Int, defaultValue: 100 }) limit: number,
  ): Promise<GrpcCallLog[]> {
    return this.grpcCallLogsService.findAll(limit);
  }
}
