import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { APP_GUARD } from '@nestjs/core';
import { join } from 'path';

import { CustomThrottlerGuard } from './common/guards';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GrpcProxyModule } from './grpc-proxy/grpc-proxy.module';
import { FavoritesModule } from './favorites/favorites.module';
import { SearchHistoryModule } from './search-history/search-history.module';
import { SavedSearchModule } from './saved-search/saved-search.module';
import { GrpcCallLogsModule } from './grpc-call-logs/grpc-call-logs.module';
import { NotificationsModule } from './notifications/notifications.module';

import { User } from './users/entities/user.entity';
import { Favorite } from './favorites/entities/favorite.entity';
import { FavoriteCollection } from './favorites/entities/favorite-collection.entity';
import { SearchHistory } from './search-history/entities/search-history.entity';
import { SavedSearch } from './saved-search/entities/saved-search.entity';
import { GrpcCallLog } from './grpc-call-logs/entities/grpc-call-log.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'grpc_client'),
        entities: [
          User,
          Favorite,
          FavoriteCollection,
          SearchHistory,
          SavedSearch,
          GrpcCallLog,
        ],
        synchronize: true, // For development only
      }),
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      playground: true,
      context: ({ req, res }) => ({ req, res }),
    }),
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60000, limit: 60 }],
    }),
    CacheModule.register({ isGlobal: true }),
    NotificationsModule,
    UsersModule,
    AuthModule,
    GrpcProxyModule,
    FavoritesModule,
    SearchHistoryModule,
    SavedSearchModule,
    GrpcCallLogsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
