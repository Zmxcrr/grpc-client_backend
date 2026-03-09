import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Request } from 'express';
import { FavoritesService } from './favorites.service';
import {
  AddFavoriteDto,
  CreateCollectionDto,
  UpdateCollectionDto,
} from './dto';

@ApiTags('favorites')
@Controller()
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  // --- Favorites ---

  @Get('favorites')
  @ApiOperation({ summary: 'Get all favorites' })
  async findAll(@Req() req: Request) {
    const user = req.user as any;
    return this.favoritesService.findAllByUser(user.id);
  }

  @Post('favorites')
  @ApiOperation({ summary: 'Add to favorites' })
  async add(@Req() req: Request, @Body() dto: AddFavoriteDto) {
    const user = req.user as any;
    return this.favoritesService.addFavorite(
      user.id,
      dto.itemId,
      dto.payload,
      dto.collectionId,
    );
  }

  @Delete('favorites/:itemId')
  @ApiOperation({ summary: 'Remove from favorites' })
  async remove(@Req() req: Request, @Param('itemId') itemId: string) {
    const user = req.user as any;
    await this.favoritesService.removeFavorite(user.id, itemId);
    return { message: 'Removed from favorites' };
  }

  // --- Collections ---

  @Get('favorite-collections')
  @ApiOperation({ summary: 'Get all favorite collections' })
  async findAllCollections(@Req() req: Request) {
    const user = req.user as any;
    return this.favoritesService.findAllCollections(user.id);
  }

  @Post('favorite-collections')
  @ApiOperation({ summary: 'Create a favorite collection' })
  async createCollection(
    @Req() req: Request,
    @Body() dto: CreateCollectionDto,
  ) {
    const user = req.user as any;
    return this.favoritesService.createCollection(user.id, dto.name);
  }

  @Patch('favorite-collections/:id')
  @ApiOperation({ summary: 'Update a favorite collection' })
  async updateCollection(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
  ) {
    const user = req.user as any;
    return this.favoritesService.updateCollection(user.id, id, dto.name);
  }

  @Delete('favorite-collections/:id')
  @ApiOperation({ summary: 'Delete a favorite collection' })
  async deleteCollection(@Req() req: Request, @Param('id') id: string) {
    const user = req.user as any;
    await this.favoritesService.deleteCollection(user.id, id);
    return { message: 'Collection deleted' };
  }
}
