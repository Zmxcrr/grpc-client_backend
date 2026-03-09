import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { Favorite } from './entities/favorite.entity';
import { FavoriteCollection } from './entities/favorite-collection.entity';
import { NotificationsService } from '../notifications/notifications.service';

describe('FavoritesService', () => {
  let service: FavoritesService;
  let favoriteRepo: jest.Mocked<Partial<Repository<Favorite>>>;
  let collectionRepo: jest.Mocked<Partial<Repository<FavoriteCollection>>>;
  let cacheManager: Record<string, jest.Mock>;
  let notificationsService: jest.Mocked<Partial<NotificationsService>>;

  beforeEach(async () => {
    favoriteRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    collectionRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    notificationsService = {
      emitToUser: jest.fn(),
      emitAdminGrpcEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: getRepositoryToken(Favorite), useValue: favoriteRepo },
        {
          provide: getRepositoryToken(FavoriteCollection),
          useValue: collectionRepo,
        },
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: NotificationsService, useValue: notificationsService },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  describe('addFavorite', () => {
    it('should create favorite, invalidate cache and emit notification', async () => {
      const favorite: Partial<Favorite> = {
        id: 'fav-1',
        userId: 'user-1',
        itemId: 'item-1',
        payload: undefined,
        collectionId: undefined as any,
        createdAt: new Date(),
      };
      favoriteRepo.findOne!.mockResolvedValue(null);
      favoriteRepo.create!.mockReturnValue(favorite as Favorite);
      favoriteRepo.save!.mockResolvedValue(favorite as Favorite);
      cacheManager.del.mockResolvedValue(undefined);

      const result = await service.addFavorite('user-1', 'item-1');

      expect(favoriteRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1', itemId: 'item-1' },
      });
      expect(favoriteRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        itemId: 'item-1',
        payload: undefined,
        collectionId: undefined,
      });
      expect(favoriteRepo.save).toHaveBeenCalled();
      expect(cacheManager.del).toHaveBeenCalledWith('favorites:user-1');
      expect(notificationsService.emitToUser).toHaveBeenCalledWith(
        'user-1',
        'favorite.added',
        { itemId: 'item-1' },
      );
      expect(result).toEqual(favorite);
    });

    it('should throw ConflictException for duplicate favorite', async () => {
      favoriteRepo.findOne!.mockResolvedValue({
        id: 'fav-1',
        userId: 'user-1',
        itemId: 'item-1',
      } as Favorite);

      await expect(
        service.addFavorite('user-1', 'item-1'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('removeFavorite', () => {
    it('should remove favorite, invalidate cache and emit notification', async () => {
      favoriteRepo.delete!.mockResolvedValue({ affected: 1 } as any);
      cacheManager.del.mockResolvedValue(undefined);

      await service.removeFavorite('user-1', 'item-1');

      expect(favoriteRepo.delete).toHaveBeenCalledWith({
        userId: 'user-1',
        itemId: 'item-1',
      });
      expect(cacheManager.del).toHaveBeenCalledWith('favorites:user-1');
      expect(notificationsService.emitToUser).toHaveBeenCalledWith(
        'user-1',
        'favorite.removed',
        { itemId: 'item-1' },
      );
    });

    it('should throw NotFoundException when favorite not found', async () => {
      favoriteRepo.delete!.mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.removeFavorite('user-1', 'item-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByUser', () => {
    it('should return cached data when available', async () => {
      const cached = [{ id: 'fav-1', userId: 'user-1', itemId: 'item-1' }];
      cacheManager.get.mockResolvedValue(cached);

      const result = await service.findAllByUser('user-1');

      expect(cacheManager.get).toHaveBeenCalledWith('favorites:user-1');
      expect(favoriteRepo.find).not.toHaveBeenCalled();
      expect(result).toEqual(cached);
    });

    it('should query DB and set cache when no cache', async () => {
      const favorites = [
        { id: 'fav-1', userId: 'user-1', itemId: 'item-1' },
      ] as Favorite[];
      cacheManager.get.mockResolvedValue(null);
      favoriteRepo.find!.mockResolvedValue(favorites);
      cacheManager.set.mockResolvedValue(undefined);

      const result = await service.findAllByUser('user-1');

      expect(cacheManager.get).toHaveBeenCalledWith('favorites:user-1');
      expect(favoriteRepo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
      });
      expect(cacheManager.set).toHaveBeenCalledWith(
        'favorites:user-1',
        favorites,
        300000,
      );
      expect(result).toEqual(favorites);
    });
  });

  describe('createCollection', () => {
    it('should create a new collection', async () => {
      const collection: Partial<FavoriteCollection> = {
        id: 'col-1',
        userId: 'user-1',
        name: 'My Collection',
        createdAt: new Date(),
      };
      collectionRepo.findOne!.mockResolvedValue(null);
      collectionRepo.create!.mockReturnValue(collection as FavoriteCollection);
      collectionRepo.save!.mockResolvedValue(collection as FavoriteCollection);

      const result = await service.createCollection('user-1', 'My Collection');

      expect(collectionRepo.findOne).toHaveBeenCalledWith({
        where: { userId: 'user-1', name: 'My Collection' },
      });
      expect(collectionRepo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        name: 'My Collection',
      });
      expect(result).toEqual(collection);
    });

    it('should throw ConflictException for duplicate collection name', async () => {
      collectionRepo.findOne!.mockResolvedValue({
        id: 'col-1',
        userId: 'user-1',
        name: 'My Collection',
      } as FavoriteCollection);

      await expect(
        service.createCollection('user-1', 'My Collection'),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateCollection', () => {
    it('should update collection name', async () => {
      const collection = {
        id: 'col-1',
        userId: 'user-1',
        name: 'Old Name',
        createdAt: new Date(),
      } as FavoriteCollection;
      const updated = { ...collection, name: 'New Name' };
      collectionRepo.findOne!.mockResolvedValue(collection);
      collectionRepo.save!.mockResolvedValue(updated);

      const result = await service.updateCollection(
        'user-1',
        'col-1',
        'New Name',
      );

      expect(collectionRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'col-1', userId: 'user-1' },
      });
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when collection not found', async () => {
      collectionRepo.findOne!.mockResolvedValue(null);

      await expect(
        service.updateCollection('user-1', 'col-1', 'New Name'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteCollection', () => {
    it('should delete collection', async () => {
      collectionRepo.delete!.mockResolvedValue({ affected: 1 } as any);

      await service.deleteCollection('user-1', 'col-1');

      expect(collectionRepo.delete).toHaveBeenCalledWith({
        id: 'col-1',
        userId: 'user-1',
      });
    });

    it('should throw NotFoundException when collection not found', async () => {
      collectionRepo.delete!.mockResolvedValue({ affected: 0 } as any);

      await expect(
        service.deleteCollection('user-1', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
