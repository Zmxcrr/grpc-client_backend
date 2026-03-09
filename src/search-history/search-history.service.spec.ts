import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { SearchHistoryService } from './search-history.service';
import { SearchHistory } from './entities/search-history.entity';

describe('SearchHistoryService', () => {
  let service: SearchHistoryService;
  let repo: jest.Mocked<Partial<Repository<SearchHistory>>>;
  let cacheManager: Record<string, jest.Mock>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchHistoryService,
        { provide: getRepositoryToken(SearchHistory), useValue: repo },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<SearchHistoryService>(SearchHistoryService);
  });

  describe('add', () => {
    it('should create entry and invalidate cache', async () => {
      const entry: Partial<SearchHistory> = {
        id: 'sh-1',
        userId: 'user-1',
        query: 'test query',
        filters: { type: 'api' },
        createdAt: new Date(),
      };
      repo.create!.mockReturnValue(entry as SearchHistory);
      repo.save!.mockResolvedValue(entry as SearchHistory);
      cacheManager.del.mockResolvedValue(undefined);

      const result = await service.add('user-1', 'test query', {
        type: 'api',
      });

      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        query: 'test query',
        filters: { type: 'api' },
      });
      expect(repo.save).toHaveBeenCalledWith(entry);
      // Should invalidate cache for common limit values
      expect(cacheManager.del).toHaveBeenCalledWith(
        'history:user-1:limit=10',
      );
      expect(cacheManager.del).toHaveBeenCalledWith(
        'history:user-1:limit=50',
      );
      expect(result).toEqual(entry);
    });
  });

  describe('findByUser', () => {
    it('should return cached data when available', async () => {
      const cached = [
        { id: 'sh-1', userId: 'user-1', query: 'test' },
      ] as SearchHistory[];
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.findByUser('user-1');

      expect(cacheManager.get).toHaveBeenCalledWith(
        'history:user-1:limit=50',
      );
      expect(repo.find).not.toHaveBeenCalled();
      expect(result).toEqual(cached);
    });

    it('should query DB and cache when no cache', async () => {
      const results = [
        { id: 'sh-1', userId: 'user-1', query: 'test' },
      ] as SearchHistory[];
      cacheManager.get.mockResolvedValue(null);
      repo.find!.mockResolvedValue(results);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.findByUser('user-1');

      expect(cacheManager.get).toHaveBeenCalledWith(
        'history:user-1:limit=50',
      );
      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'history:user-1:limit=50',
        results,
        300000,
      );
      expect(result).toEqual(results);
    });

    it('should use custom limit', async () => {
      cacheManager.get.mockResolvedValue(null);
      repo.find!.mockResolvedValue([]);
      cacheManager.set.mockResolvedValue(undefined);

      await service.findByUser('user-1', 10);

      expect(cacheManager.get).toHaveBeenCalledWith(
        'history:user-1:limit=10',
      );
      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
        take: 10,
      });
    });
  });

  describe('clearByUser', () => {
    it('should delete entries and invalidate cache', async () => {
      repo.delete!.mockResolvedValue({ affected: 5 } as any);
      cacheManager.del.mockResolvedValue(undefined);

      await service.clearByUser('user-1');

      expect(repo.delete).toHaveBeenCalledWith({ userId: 'user-1' });
      expect(cacheManager.del).toHaveBeenCalledWith(
        'history:user-1:limit=10',
      );
      expect(cacheManager.del).toHaveBeenCalledWith(
        'history:user-1:limit=20',
      );
      expect(cacheManager.del).toHaveBeenCalledWith(
        'history:user-1:limit=50',
      );
      expect(cacheManager.del).toHaveBeenCalledWith(
        'history:user-1:limit=100',
      );
    });
  });
});
