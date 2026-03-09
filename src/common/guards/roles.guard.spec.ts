import { Reflector } from '@nestjs/core';
import { ExecutionContext } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { Role } from '../enums/role.enum';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = {
      getAllAndOverride: jest.fn(),
    } as any;
    guard = new RolesGuard(reflector);
  });

  function createMockContext(user?: any, type = 'http'): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      getType: jest.fn().mockReturnValue(type),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({ user }),
      }),
    } as any;
  }

  describe('canActivate', () => {
    it('should allow when no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(undefined);
      const context = createMockContext({ role: Role.USER });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow when user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const context = createMockContext({ role: Role.ADMIN });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny when user does not have required role', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const context = createMockContext({ role: Role.USER });

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should deny when no user is present', () => {
      reflector.getAllAndOverride.mockReturnValue([Role.ADMIN]);
      const context = createMockContext(undefined);

      expect(guard.canActivate(context)).toBe(false);
    });

    it('should allow when user has one of multiple required roles', () => {
      reflector.getAllAndOverride.mockReturnValue([
        Role.ADMIN,
        Role.MODERATOR,
      ]);
      const context = createMockContext({ role: Role.MODERATOR });

      expect(guard.canActivate(context)).toBe(true);
    });
  });
});
