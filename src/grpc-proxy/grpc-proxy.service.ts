import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';
import { GrpcCallLogsService } from '../grpc-call-logs/grpc-call-logs.service.js';
import { NotificationsService } from '../notifications/notifications.service.js';
import { SearchHistoryService } from '../search-history/search-history.service.js';

@Injectable()
export class GrpcProxyService implements OnModuleInit {
  private searchClient: any;
  private readonly logger = new Logger(GrpcProxyService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly grpcCallLogsService: GrpcCallLogsService,
    private readonly notificationsService: NotificationsService,
    private readonly searchHistoryService: SearchHistoryService,
  ) {}

  onModuleInit() {
    try {
      const protoPath = join(__dirname, '..', 'proto', 'search.proto');
      const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });
      const proto = grpc.loadPackageDefinition(packageDefinition) as any;
      const grpcUrl = this.configService.get<string>(
        'GRPC_URL',
        'localhost:50051',
      );
      this.searchClient = new proto.search.SearchService(
        grpcUrl,
        grpc.credentials.createInsecure(),
      );
      this.logger.log(`gRPC client connected to ${grpcUrl}`);
    } catch (error) {
      this.logger.warn(
        'gRPC client initialization failed, using mock mode: ' + error.message,
      );
    }
  }

  async search(
    query: string,
    filters: Record<string, any> | undefined,
    userId?: string,
  ): Promise<any> {
    const startTime = Date.now();

    // Auto-add to search history
    if (userId) {
      await this.searchHistoryService.add(userId, query, filters);
    }

    try {
      const result = await this.callGrpcSearch(query, filters);
      const durationMs = Date.now() - startTime;

      // Log gRPC call
      await this.grpcCallLogsService.logAndEmit({
        userId,
        service: 'SearchService',
        method: 'Search',
        request: { query, filters },
        durationMs,
        status: 'OK',
      });

      // Notify user
      if (userId) {
        this.notificationsService.emitToUser(userId, 'search.done', {
          query,
          resultCount: result.total,
        });
      }

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;

      await this.grpcCallLogsService.logAndEmit({
        userId,
        service: 'SearchService',
        method: 'Search',
        request: { query, filters },
        durationMs,
        status: 'ERROR',
        errorMessage: error.message,
      });

      if (userId) {
        this.notificationsService.emitToUser(userId, 'search.error', {
          query,
          error: error.message,
        });
      }

      throw error;
    }
  }

  private callGrpcSearch(
    query: string,
    filters?: Record<string, any>,
  ): Promise<any> {
    if (!this.searchClient) {
      // Mock response when gRPC is not connected
      return Promise.resolve({
        results: [
          {
            id: 'mock-1',
            title: `Result for: ${query}`,
            description: 'Mock result (gRPC service not connected)',
            score: 1.0,
          },
        ],
        total: 1,
      });
    }

    return new Promise((resolve, reject) => {
      this.searchClient.Search(
        { query, filters: filters ? JSON.stringify(filters) : '' },
        { deadline: new Date(Date.now() + 5000) },
        (error: any, response: any) => {
          if (error) {
            reject(error instanceof Error ? error : new Error(String(error)));
          } else {
            resolve(response);
          }
        },
      );
    });
  }
}
