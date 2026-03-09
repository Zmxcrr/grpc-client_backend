import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchHistory } from './entities/search-history.entity';
import { SearchHistoryService } from './search-history.service';
import { SearchHistoryController } from './search-history.controller';
import { SearchHistoryResolver } from './search-history.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([SearchHistory])],
  providers: [SearchHistoryService, SearchHistoryResolver],
  controllers: [SearchHistoryController],
  exports: [SearchHistoryService],
})
export class SearchHistoryModule {}
