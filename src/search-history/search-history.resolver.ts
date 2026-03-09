import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SearchHistoryService } from './search-history.service';
import { SearchHistory } from './entities/search-history.entity';
import { GqlAuthGuard } from '../common/guards';
import { CurrentUser } from '../common/decorators';

@Resolver(() => SearchHistory)
export class SearchHistoryResolver {
  constructor(private readonly searchHistoryService: SearchHistoryService) {}

  @Query(() => [SearchHistory])
  @UseGuards(GqlAuthGuard)
  async history(
    @CurrentUser() user: any,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
  ): Promise<SearchHistory[]> {
    return this.searchHistoryService.findByUser(user.id, limit);
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async clearHistory(@CurrentUser() user: any): Promise<boolean> {
    await this.searchHistoryService.clearByUser(user.id);
    return true;
  }
}
