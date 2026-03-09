import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerRequest } from '@nestjs/throttler';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    return req.ip;
  }

  async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    const { context } = requestProps;
    const type = context.getType<string>();
    let req: any;

    if (type === 'graphql') {
      const gqlCtx = GqlExecutionContext.create(context);
      req = gqlCtx.getContext().req;
    } else {
      req = context.switchToHttp().getRequest();
    }

    // Determine role-based limit
    const user = req?.user;
    if (user) {
      const roleLimits: Record<string, number> = {
        USER: 60,
        PREMIUM: 180,
        MODERATOR: 300,
        ADMIN: 1000,
      };
      const limit = roleLimits[user.role] || 60;
      requestProps.limit = limit;
    }

    return super.handleRequest(requestProps);
  }
}
