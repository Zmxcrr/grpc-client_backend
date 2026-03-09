import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrpcCallLog } from './entities/grpc-call-log.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class GrpcCallLogsService {
  constructor(
    @InjectRepository(GrpcCallLog)
    private readonly grpcCallLogRepository: Repository<GrpcCallLog>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async logAndEmit(data: {
    userId?: string;
    service: string;
    method: string;
    request?: Record<string, any>;
    durationMs: number;
    status: string;
    errorMessage?: string;
  }): Promise<GrpcCallLog> {
    const log = this.grpcCallLogRepository.create(data);
    const saved = await this.grpcCallLogRepository.save(log);

    // Push to admin SSE stream
    this.notificationsService.emitAdminGrpcEvent({
      id: saved.id,
      userId: saved.userId,
      service: saved.service,
      method: saved.method,
      durationMs: saved.durationMs,
      status: saved.status,
      errorMessage: saved.errorMessage,
      createdAt: saved.createdAt,
    });

    return saved;
  }

  async findAll(limit = 100): Promise<GrpcCallLog[]> {
    return this.grpcCallLogRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
