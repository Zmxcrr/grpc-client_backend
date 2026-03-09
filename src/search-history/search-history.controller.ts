import { Controller, Get, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { SearchHistoryService } from './search-history.service';

@ApiTags('history')
@Controller('history')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SearchHistoryController {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get search history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Req() req: Request, @Query('limit') limit?: number) {
    const user = req.user as any;
    return this.searchHistoryService.findByUser(user.id, limit || 50);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear search history' })
  async clear(@Req() req: Request) {
    const user = req.user as any;
    await this.searchHistoryService.clearByUser(user.id);
    return { message: 'History cleared' };
  }
}
