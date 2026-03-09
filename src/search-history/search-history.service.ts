import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { SearchHistory } from './entities/search-history.entity';

@Injectable()
export class SearchHistoryService {
  constructor(
    @InjectRepository(SearchHistory)
    private readonly searchHistoryRepository: Repository<SearchHistory>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async add(
    userId: string,
    query: string,
    filters?: Record<string, any>,
  ): Promise<SearchHistory> {
    const entry = this.searchHistoryRepository.create({
      userId,
      query,
      filters,
    });
    const saved = await this.searchHistoryRepository.save(entry);
    // Invalidate cache
    await this.invalidateCache(userId);
    return saved;
  }

  async findByUser(userId: string, limit = 50): Promise<SearchHistory[]> {
    const cacheKey = `history:${userId}:limit=${limit}`;
    const cached = await this.cacheManager.get<SearchHistory[]>(cacheKey);
    if (cached) {
      return cached;
    }
    const results = await this.searchHistoryRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
    await this.cacheManager.set(cacheKey, results, 300000); // 5 min TTL
    return results;
  }

  async clearByUser(userId: string): Promise<void> {
    await this.searchHistoryRepository.delete({ userId });
    await this.invalidateCache(userId);
  }

  private async invalidateCache(userId: string): Promise<void> {
    // Invalidate common limit values
    const commonLimits = [10, 20, 50, 100];
    for (const limit of commonLimits) {
      await this.cacheManager.del(`history:${userId}:limit=${limit}`);
    }
  }
}
