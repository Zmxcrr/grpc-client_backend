import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SavedSearch } from './entities/saved-search.entity';

@Injectable()
export class SavedSearchService {
  constructor(
    @InjectRepository(SavedSearch)
    private readonly savedSearchRepository: Repository<SavedSearch>,
  ) {}

  async create(
    userId: string,
    name: string,
    query: string,
    filters?: Record<string, any>,
  ): Promise<SavedSearch> {
    const savedSearch = this.savedSearchRepository.create({
      userId,
      name,
      query,
      filters,
    });
    return this.savedSearchRepository.save(savedSearch);
  }

  async findAllByUser(userId: string): Promise<SavedSearch[]> {
    return this.savedSearchRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async update(
    userId: string,
    id: string,
    data: Partial<Pick<SavedSearch, 'name' | 'query' | 'filters'>>,
  ): Promise<SavedSearch> {
    const savedSearch = await this.savedSearchRepository.findOne({
      where: { id, userId },
    });
    if (!savedSearch) {
      throw new NotFoundException('Saved search not found');
    }
    Object.assign(savedSearch, data);
    return this.savedSearchRepository.save(savedSearch);
  }

  async delete(userId: string, id: string): Promise<void> {
    const result = await this.savedSearchRepository.delete({ id, userId });
    if (result.affected === 0) {
      throw new NotFoundException('Saved search not found');
    }
  }
}
