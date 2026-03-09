import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role } from '../../common/enums/role.enum';
import { Favorite } from '../../favorites/entities/favorite.entity';
import { FavoriteCollection } from '../../favorites/entities/favorite-collection.entity';
import { SearchHistory } from '../../search-history/entities/search-history.entity';
import { SavedSearch } from '../../saved-search/entities/saved-search.entity';

registerEnumType(Role, { name: 'Role' });

@ObjectType()
@Entity('users')
export class User {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Field(() => Role)
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role: Role;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Favorite, (fav) => fav.user)
  favorites: Favorite[];

  @OneToMany(() => FavoriteCollection, (col) => col.user)
  favoriteCollections: FavoriteCollection[];

  @OneToMany(() => SearchHistory, (sh) => sh.user)
  searchHistory: SearchHistory[];

  @OneToMany(() => SavedSearch, (ss) => ss.user)
  savedSearches: SavedSearch[];
}
