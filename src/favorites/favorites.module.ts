import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { FavoriteCollection } from './entities/favorite-collection.entity';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { FavoritesResolver } from './favorites.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Favorite, FavoriteCollection])],
  providers: [FavoritesService, FavoritesResolver],
  controllers: [FavoritesController],
  exports: [FavoritesService],
})
export class FavoritesModule {}
