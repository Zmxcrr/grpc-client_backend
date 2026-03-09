import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GrpcCallLogsService } from './grpc-call-logs.service';
import { GrpcCallLog } from './entities/grpc-call-log.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('GrpcCallLogsService', () => {
  let service: GrpcCallLogsService;
  let repo: jest.Mocked<Partial<Repository<GrpcCallLog>>>;
  let notificationsService: jest.Mocked<Partial<NotificationsService>>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };

    notificationsService = {
      emitAdminGrpcEvent: jest.fn(),
      emitToUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GrpcCallLogsService,
        { provide: getRepositoryToken(GrpcCallLog), useValue: repo },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<GrpcCallLogsService>(GrpcCallLogsService);
  });

  describe('logAndEmit', () => {
    it('should save log and emit admin event', async () => {
      const logData = {
        userId: 'user-1',
        service: 'UserService',
        method: 'GetUser',
        request: { id: '1' },
        durationMs: 150,
        status: 'OK',
      };

      const savedLog: Partial<GrpcCallLog> = {
        id: 'log-1',
        ...logData,
        errorMessage: undefined as any,
        createdAt: new Date(),
      };

      repo.create!.mockReturnValue(savedLog as GrpcCallLog);
      repo.save!.mockResolvedValue(savedLog as GrpcCallLog);

      const result = await service.logAndEmit(logData);

      expect(repo.create).toHaveBeenCalledWith(logData);
      expect(repo.save).toHaveBeenCalledWith(savedLog);
      expect(notificationsService.emitAdminGrpcEvent).toHaveBeenCalledWith({
        id: savedLog.id,
        userId: savedLog.userId,
        service: savedLog.service,
        method: savedLog.method,
        durationMs: savedLog.durationMs,
        status: savedLog.status,
        errorMessage: savedLog.errorMessage,
        createdAt: savedLog.createdAt,
      });
      expect(result).toEqual(savedLog);
    });
  });

  describe('findAll', () => {
    it('should return logs with default limit', async () => {
      const logs = [
        {
          id: 'log-1',
          service: 'UserService',
          method: 'GetUser',
          durationMs: 100,
          status: 'OK',
          createdAt: new Date(),
        },
      ] as GrpcCallLog[];
      repo.find!.mockResolvedValue(logs);

      const result = await service.findAll();

      expect(repo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 100,
      });
      expect(result).toEqual(logs);
    });

    it('should return logs with custom limit', async () => {
      repo.find!.mockResolvedValue([]);

      await service.findAll(10);

      expect(repo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 10,
      });
    });
  });
});
