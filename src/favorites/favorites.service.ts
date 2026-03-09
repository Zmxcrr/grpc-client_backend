import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Favorite } from './entities/favorite.entity';
import { FavoriteCollection } from './entities/favorite-collection.entity';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(FavoriteCollection)
    private readonly collectionRepository: Repository<FavoriteCollection>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly notificationsService: NotificationsService,
  ) {}

  // --- Favorites ---

  async addFavorite(
    userId: string,
    itemId: string,
    payload?: Record<string, any>,
    collectionId?: string,
  ): Promise<Favorite> {
    const existing = await this.favoriteRepository.findOne({
      where: { userId, itemId },
    });
    if (existing) {
      throw new ConflictException('Item already in favorites');
    }
    const favorite = this.favoriteRepository.create({
      userId,
      itemId,
      payload,
      collectionId,
    });
    const saved = await this.favoriteRepository.save(favorite);
    await this.invalidateFavoritesCache(userId);
    this.notificationsService.emitToUser(userId, 'favorite.added', {
      itemId,
    });
    return saved;
  }

  async removeFavorite(userId: string, itemId: string): Promise<void> {
    const result = await this.favoriteRepository.delete({ userId, itemId });
    if (result.affected === 0) {
      throw new NotFoundException('Favorite not found');
    }
    await this.invalidateFavoritesCache(userId);
    this.notificationsService.emitToUser(userId, 'favorite.removed', {
      itemId,
    });
  }

  async findAllByUser(userId: string): Promise<Favorite[]> {
    const cacheKey = `favorites:${userId}`;
    const cached = await this.cacheManager.get<Favorite[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const results = await this.favoriteRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    await this.cacheManager.set(cacheKey, results, 300000); // 5 min TTL
    return results;
  }

  private async invalidateFavoritesCache(userId: string): Promise<void> {
    await this.cacheManager.del(`favorites:${userId}`);
  }

  // --- Collections ---

  async createCollection(
    userId: string,
    name: string,
  ): Promise<FavoriteCollection> {
    const existing = await this.collectionRepository.findOne({
      where: { userId, name },
    });
    if (existing) {
      throw new ConflictException('Collection with this name already exists');
    }
    const collection = this.collectionRepository.create({ userId, name });
    return this.collectionRepository.save(collection);
  }

  async findAllCollections(userId: string): Promise<FavoriteCollection[]> {
    return this.collectionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      relations: ['favorites'],
    });
  }

  async updateCollection(
    userId: string,
    collectionId: string,
    name?: string,
  ): Promise<FavoriteCollection> {
    const collection = await this.collectionRepository.findOne({
      where: { id: collectionId, userId },
    });
    if (!collection) {
      throw new NotFoundException('Collection not found');
    }
    if (name !== undefined) {
      collection.name = name;
    }
    return this.collectionRepository.save(collection);
  }

  async deleteCollection(userId: string, collectionId: string): Promise<void> {
    const result = await this.collectionRepository.delete({
      id: collectionId,
      userId,
    });
    if (result.affected === 0) {
      throw new NotFoundException('Collection not found');
    }
  }
}
