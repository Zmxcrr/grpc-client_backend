import { NotificationsService } from './notifications.service';
import { firstValueFrom } from 'rxjs';
import { take, toArray } from 'rxjs/operators';

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(() => {
    service = new NotificationsService();
  });

  describe('emitToUser', () => {
    it('should emit events that can be received via getUserStream', async () => {
      const resultPromise = firstValueFrom(
        service.getUserStream('user-1').pipe(take(1)),
      );

      service.emitToUser('user-1', 'test.event', { key: 'value' });

      const result = await resultPromise;

      expect(result).toEqual({
        data: { type: 'test.event', key: 'value' },
      });
    });
  });

  describe('getUserStream', () => {
    it('should filter events by userId', async () => {
      const resultPromise = firstValueFrom(
        service.getUserStream('user-1').pipe(take(2), toArray()),
      );

      service.emitToUser('user-1', 'event1', { a: 1 });
      service.emitToUser('user-2', 'event2', { b: 2 }); // should be filtered
      service.emitToUser('user-1', 'event3', { c: 3 });

      const results = await resultPromise;

      expect(results).toHaveLength(2);
      expect(results[0]).toEqual({
        data: { type: 'event1', a: 1 },
      });
      expect(results[1]).toEqual({
        data: { type: 'event3', c: 3 },
      });
    });
  });

  describe('emitAdminGrpcEvent', () => {
    it('should emit admin events via getAdminGrpcStream', async () => {
      const resultPromise = firstValueFrom(
        service.getAdminGrpcStream().pipe(take(1)),
      );

      service.emitAdminGrpcEvent({
        id: 'log-1',
        service: 'TestService',
        method: 'TestMethod',
      });

      const result = await resultPromise;

      expect(result).toEqual({
        data: {
          type: 'grpc.call',
          id: 'log-1',
          service: 'TestService',
          method: 'TestMethod',
        },
      });
    });
  });
});
