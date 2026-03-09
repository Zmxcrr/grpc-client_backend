import { Injectable } from '@nestjs/common';
import { Subject, Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface UserNotification {
  userId: string;
  type: string;
  data: any;
}

export interface AdminGrpcEvent {
  type: string;
  data: any;
}

@Injectable()
export class NotificationsService {
  private userEvents$ = new Subject<UserNotification>();
  private adminEvents$ = new Subject<AdminGrpcEvent>();

  emitToUser(userId: string, type: string, data: any) {
    this.userEvents$.next({ userId, type, data });
  }

  emitAdminGrpcEvent(data: any) {
    this.adminEvents$.next({ type: 'grpc.call', data });
  }

  getUserStream(userId: string): Observable<MessageEvent> {
    return this.userEvents$.pipe(
      filter((event) => event.userId === userId),
      map(
        (event) =>
          ({
            data: { type: event.type, ...event.data },
          }) as MessageEvent,
      ),
    );
  }

  getAdminGrpcStream(): Observable<MessageEvent> {
    return this.adminEvents$.pipe(
      map(
        (event) =>
          ({
            data: { type: event.type, ...event.data },
          }) as MessageEvent,
      ),
    );
  }

  getHeartbeatStream(): Observable<MessageEvent> {
    return new Observable((subscriber) => {
      const interval = setInterval(() => {
        subscriber.next({
          data: { type: 'heartbeat', timestamp: new Date().toISOString() },
        } as MessageEvent);
      }, 30000);
      return () => clearInterval(interval);
    });
  }
}
