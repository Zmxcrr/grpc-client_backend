import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SavedSearchService } from './saved-search.service';
import { SavedSearch } from './entities/saved-search.entity';
import { CreateSavedSearchDto, UpdateSavedSearchDto } from './dto';
import { GqlAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Resolver(() => SavedSearch)
export class SavedSearchResolver {
  constructor(private readonly savedSearchService: SavedSearchService) {}

  @Query(() => [SavedSearch])
  @UseGuards(GqlAuthGuard)
  async savedSearches(@CurrentUser() user: any): Promise<SavedSearch[]> {
    return this.savedSearchService.findAllByUser(user.id);
  }

  @Mutation(() => SavedSearch)
  @UseGuards(GqlAuthGuard)
  async createSavedSearch(
    @CurrentUser() user: any,
    @Args('input') input: CreateSavedSearchDto,
  ): Promise<SavedSearch> {
    return this.savedSearchService.create(
      user.id,
      input.name,
      input.query,
      input.filters,
    );
  }

  @Mutation(() => SavedSearch)
  @UseGuards(GqlAuthGuard)
  async updateSavedSearch(
    @CurrentUser() user: any,
    @Args('id') id: string,
    @Args('input') input: UpdateSavedSearchDto,
  ): Promise<SavedSearch> {
    return this.savedSearchService.update(user.id, id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deleteSavedSearch(
    @CurrentUser() user: any,
    @Args('id') id: string,
  ): Promise<boolean> {
    await this.savedSearchService.delete(user.id, id);
    return true;
  }
}
