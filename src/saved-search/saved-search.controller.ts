import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { SavedSearchService } from './saved-search.service';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto';

@ApiTags('saved-searches')
@Controller('saved-searches')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class SavedSearchController {
  constructor(private readonly savedSearchService: SavedSearchService) {}

  @Get()
  @ApiOperation({ summary: 'Get all saved searches' })
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.savedSearchService.findAllByUser(user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a saved search' })
  async create(@Req() req: Request, @Body() dto: CreateSavedSearchDto) {
    const user = req.user as any;
    return this.savedSearchService.create(
      user.id,
      dto.name,
      dto.query,
      dto.filters,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a saved search' })
  async update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateSavedSearchDto,
  ) {
    const user = req.user as any;
    return this.savedSearchService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a saved search' })
  async delete(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    await this.savedSearchService.delete(user.id, id);
    return { message: 'Saved search deleted' };
  }
}
