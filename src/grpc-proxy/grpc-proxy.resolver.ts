import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { GrpcProxyService } from './grpc-proxy.service';
import { ProxySearchDto, ProxySearchResponse } from './dto';
import { GqlAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Resolver()
export class GrpcProxyResolver {
  constructor(private readonly grpcProxyService: GrpcProxyService) {}

  @Query(() => ProxySearchResponse)
  @UseGuards(GqlAuthGuard)
  async proxySearch(
    @Args('input') input: ProxySearchDto,
    @CurrentUser() user: any,
  ): Promise<ProxySearchResponse> {
    return this.grpcProxyService.search(input.query, input.filters, user.id);
  }
}
