import {
  Controller,
  Post,
  Body,
  Res,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import type { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { SetRoleDto } from './dto/set-role.dto.js';
import { AuthResponse } from './dto/auth-response.dto.js';
import { CurrentUser, Roles } from '../common/decorators/index.js';
import { RolesGuard } from '../common/guards/index.js';
import { Role } from '../common/enums/role.enum.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, type: AuthResponse })
  async register(@Body() dto: RegisterDto, @Res() res: Response) {
    const result = await this.authService.register(dto);
    res.cookie('jwt', result.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    return res.json(result);
  }

  @Post('login')
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, type: AuthResponse })
  async login(@Body() dto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(dto);
    res.cookie('jwt', result.accessToken, {
      httpOnly: true,
      sameSite: 'strict',
    });
    return res.json(result);
  }

  @Post('set-role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set user role (ADMIN only)' })
  async setRole(@Body() dto: SetRoleDto) {
    return this.authService.setUserRole(dto.userId, dto.role);
  }
}
