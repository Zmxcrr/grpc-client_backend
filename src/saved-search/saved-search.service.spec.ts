import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { SavedSearchService } from './saved-search.service';
import { SavedSearch } from './entities/saved-search.entity';

describe('SavedSearchService', () => {
  let service: SavedSearchService;
  let repo: jest.Mocked<Partial<Repository<SavedSearch>>>;

  const mockSavedSearch: SavedSearch = {
    id: 'ss-1',
    userId: 'user-1',
    name: 'My Search',
    query: 'test query',
    filters: { type: 'api' },
    createdAt: new Date(),
    user: null as any,
  };

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SavedSearchService,
        { provide: getRepositoryToken(SavedSearch), useValue: repo },
      ],
    }).compile();

    service = module.get<SavedSearchService>(SavedSearchService);
  });

  describe('create', () => {
    it('should create and save a new saved search', async () => {
      repo.create!.mockReturnValue(mockSavedSearch);
      repo.save!.mockResolvedValue(mockSavedSearch);

      const result = await service.create('user-1', 'My Search', 'test query', {
        type: 'api',
      });

      expect(repo.create).toHaveBeenCalledWith({
        userId: 'user-1',
        name: 'My Search',
        query: 'test query',
        filters: { type: 'api' },
      });
      expect(repo.save).toHaveBeenCalledWith(mockSavedSearch);
      expect(result).toEqual(mockSavedSearch);
    });
  });

  describe('findAllByUser', () => {
    it('should return all saved searches for a user', async () => {
      const searches = [mockSavedSearch];
      repo.find!.mockResolvedValue(searches);

      const result = await service.findAllByUser('user-1');

      expect(repo.find).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(searches);
    });
  });

  describe('update', () => {
    it('should update a saved search', async () => {
      const updated = { ...mockSavedSearch, name: 'Updated Name' };
      repo.findOne!.mockResolvedValue({ ...mockSavedSearch });
      repo.save!.mockResolvedValue(updated);

      const result = await service.update('user-1', 'ss-1', {
        name: 'Updated Name',
      });

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'ss-1', userId: 'user-1' },
      });
      expect(repo.save).toHaveBeenCalled();
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when saved search not found', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(
        service.update('user-1', 'nonexistent', { name: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete a saved search', async () => {
      repo.delete!.mockResolvedValue({ affected: 1 } as any);

      await service.delete('user-1', 'ss-1');

      expect(repo.delete).toHaveBeenCalledWith({
        id: 'ss-1',
        userId: 'user-1',
      });
    });

    it('should throw NotFoundException when saved search not found', async () => {
      repo.delete!.mockResolvedValue({ affected: 0 } as any);

      await expect(service.delete('user-1', 'nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
