import { Module } from '@nestjs/common';
import { GrpcProxyService } from './grpc-proxy.service.js';
import { GrpcProxyController } from './grpc-proxy.controller.js';
import { GrpcProxyResolver } from './grpc-proxy.resolver.js';
import { GrpcCallLogsModule } from '../grpc-call-logs/grpc-call-logs.module.js';
import { SearchHistoryModule } from '../search-history/search-history.module.js';

@Module({
  imports: [GrpcCallLogsModule, SearchHistoryModule],
  providers: [GrpcProxyService, GrpcProxyResolver],
  controllers: [GrpcProxyController],
  exports: [GrpcProxyService],
})
export class GrpcProxyModule {}
