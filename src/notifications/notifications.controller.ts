import { Controller, Sse, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable, merge } from 'rxjs';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiProduces,
} from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { Request } from 'express';
import { NotificationsService } from './notifications.service';
import { RolesGuard } from '../common/guards';
import { Roles } from '../common/decorators';
import { Role } from '../common/enums/role.enum';

@ApiTags('sse')
@Controller('sse')
@SkipThrottle()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Sse('events')
  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'User notifications SSE stream' })
  @ApiProduces('text/event-stream')
  userEvents(@Req() req: Request): Observable<MessageEvent> {
    const user = req.user as any;
    return merge(
      this.notificationsService.getUserStream(user.id),
      this.notificationsService.getHeartbeatStream(),
    );
  }

  @Sse('admin/grpc-calls')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.MODERATOR, Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Admin gRPC calls monitoring SSE stream' })
  @ApiProduces('text/event-stream')
  adminGrpcCalls(): Observable<MessageEvent> {
    return this.notificationsService.getAdminGrpcStream();
  }
}
