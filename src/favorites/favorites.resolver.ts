import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Favorite } from './entities/favorite.entity';
import { FavoriteCollection } from './entities/favorite-collection.entity';
import {
  AddFavoriteDto,
  CreateCollectionDto,
  UpdateCollectionDto,
} from './dto';
import { GqlAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Resolver()
export class FavoritesResolver {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Query(() => [Favorite])
  @UseGuards(GqlAuthGuard)
  async favorites(@CurrentUser() user: any): Promise<Favorite[]> {
    return this.favoritesService.findAllByUser(user.id);
  }

  @Query(() => [FavoriteCollection])
  @UseGuards(GqlAuthGuard)
  async favoriteCollections(
    @CurrentUser() user: any,
  ): Promise<FavoriteCollection[]> {
    return this.favoritesService.findAllCollections(user.id);
  }

  @Mutation(() => Favorite)
  @UseGuards(GqlAuthGuard)
  async addFavorite(
    @CurrentUser() user: any,
    @Args('input') input: AddFavoriteDto,
  ): Promise<Favorite> {
    return this.favoritesService.addFavorite(
      user.id,
      input.itemId,
      input.payload,
      input.collectionId,
    );
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async removeFavorite(
    @CurrentUser() user: any,
    @Args('itemId') itemId: string,
  ): Promise<boolean> {
    await this.favoritesService.removeFavorite(user.id, itemId);
    return true;
  }

  @Mutation(() => FavoriteCollection)
  @UseGuards(GqlAuthGuard)
  async createCollection(
    @CurrentUser() user: any,
    @Args('input') input: CreateCollectionDto,
  ): Promise<FavoriteCollection> {
    return this.favoritesService.createCollection(user.id, input.name);
  }

  @Mutation(() => FavoriteCollection)
  @UseGuards(GqlAuthGuard)
  async updateCollection(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('input') input: UpdateCollectionDto,
  ): Promise<FavoriteCollection> {
    return this.favoritesService.updateCollection(user.id, id, input.name);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteCollection(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ): Promise<boolean> {
    await this.favoritesService.deleteCollection(user.id, id);
    return true;
  }
}
