import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SavedSearch } from './entities/saved-search.entity';
import { SavedSearchService } from './saved-search.service';
import { SavedSearchController } from './saved-search.controller';
import { SavedSearchResolver } from './saved-search.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([SavedSearch])],
  providers: [SavedSearchService, SavedSearchResolver],
  controllers: [SavedSearchController],
  exports: [SavedSearchService],
})
export class SavedSearchModule {}
