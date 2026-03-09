import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GrpcCallLog } from './entities/grpc-call-log.entity';
import { GrpcCallLogsService } from './grpc-call-logs.service';
import { GrpcCallLogsController } from './grpc-call-logs.controller';
import { GrpcCallLogsResolver } from './grpc-call-logs.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([GrpcCallLog])],
  providers: [GrpcCallLogsService, GrpcCallLogsResolver],
  controllers: [GrpcCallLogsController],
  exports: [GrpcCallLogsService],
})
export class GrpcCallLogsModule {}
