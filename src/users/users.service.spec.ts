import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../common/enums/role.enum';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<Partial<Repository<User>>>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    role: Role.USER,
    createdAt: new Date(),
    favorites: [],
    favoriteCollections: [],
    searchHistory: [],
    savedSearches: [],
  };

  beforeEach(async () => {
    repo = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: repo },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('findByEmail', () => {
    it('should return a user by email', async () => {
      repo.findOne!.mockResolvedValue(mockUser);

      const result = await service.findByEmail('test@example.com');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      repo.findOne!.mockResolvedValue(null);

      const result = await service.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      repo.findOne!.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      repo.findOne!.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and save a new user', async () => {
      const createdUser = { email: 'new@example.com', passwordHash: 'hashed' };
      repo.create!.mockReturnValue(mockUser);
      repo.save!.mockResolvedValue(mockUser);

      const result = await service.create('new@example.com', 'hashed');

      expect(repo.create).toHaveBeenCalledWith({
        email: 'new@example.com',
        passwordHash: 'hashed',
      });
      expect(repo.save).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('setRole', () => {
    it('should update user role and return user', async () => {
      const updatedUser = { ...mockUser, role: Role.ADMIN };
      repo.update!.mockResolvedValue({ affected: 1 } as any);
      repo.findOne!.mockResolvedValue(updatedUser);

      const result = await service.setRole('user-1', Role.ADMIN);

      expect(repo.update).toHaveBeenCalledWith('user-1', {
        role: Role.ADMIN,
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw error when user not found after update', async () => {
      repo.update!.mockResolvedValue({ affected: 1 } as any);
      repo.findOne!.mockResolvedValue(null);

      await expect(service.setRole('nonexistent', Role.ADMIN)).rejects.toThrow(
        'User not found',
      );
    });
  });
});
