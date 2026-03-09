import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { GrpcProxyService } from './grpc-proxy.service';
import { ProxySearchDto, ProxySearchResponse } from './dto';

@ApiTags('proxy')
@Controller('proxy')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class GrpcProxyController {
  constructor(private readonly grpcProxyService: GrpcProxyService) {}

  @Post('search')
  @ApiOperation({ summary: 'Proxy search to gRPC upstream' })
  @ApiResponse({ status: 200, type: ProxySearchResponse })
  async search(@Body() dto: ProxySearchDto, @Req() req: Request) {
    const user = req.user as any;
    return this.grpcProxyService.search(dto.query, dto.filters, user.id);
  }
}
