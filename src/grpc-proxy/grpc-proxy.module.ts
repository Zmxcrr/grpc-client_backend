import { Module } from '@nestjs/common';
import { GrpcProxyService } from './grpc-proxy.service';
import { GrpcProxyController } from './grpc-proxy.controller';
import { GrpcProxyResolver } from './grpc-proxy.resolver';
import { GrpcCallLogsModule } from '../grpc-call-logs/grpc-call-logs.module';

@Module({
  imports: [GrpcCallLogsModule],
  providers: [GrpcProxyService, GrpcProxyResolver],
  controllers: [GrpcProxyController],
  exports: [GrpcProxyService],
})
export class GrpcProxyModule {}
