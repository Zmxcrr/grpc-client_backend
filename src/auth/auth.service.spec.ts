import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '../common/enums/role.enum';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<Partial<UsersService>>;
  let jwtService: jest.Mocked<Partial<JwtService>>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      create: jest.fn(),
      setRole: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create user and return token', async () => {
      usersService.findByEmail!.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      usersService.create!.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: Role.USER,
        createdAt: new Date(),
        favorites: [],
        favoriteCollections: [],
        searchHistory: [],
        savedSearches: [],
      });

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(usersService.create).toHaveBeenCalledWith(
        'test@example.com',
        'hashed-password',
      );
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'test@example.com',
        role: Role.USER,
      });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });

    it('should throw ConflictException for duplicate email', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: Role.USER,
        createdAt: new Date(),
        favorites: [],
        favoriteCollections: [],
        searchHistory: [],
        savedSearches: [],
      });

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should return token for valid credentials', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: Role.USER,
        createdAt: new Date(),
        favorites: [],
        favoriteCollections: [],
        searchHistory: [],
        savedSearches: [],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(usersService.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashed-password',
      );
      expect(result).toEqual({ accessToken: 'signed-token' });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      usersService.findByEmail!.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      usersService.findByEmail!.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed-password',
        role: Role.USER,
        createdAt: new Date(),
        favorites: [],
        favoriteCollections: [],
        searchHistory: [],
        savedSearches: [],
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('setUserRole', () => {
    it('should delegate to usersService.setRole', async () => {
      const user = {
        id: 'user-1',
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: Role.ADMIN,
        createdAt: new Date(),
        favorites: [],
        favoriteCollections: [],
        searchHistory: [],
        savedSearches: [],
      };
      usersService.setRole!.mockResolvedValue(user);

      const result = await service.setUserRole('user-1', Role.ADMIN);

      expect(usersService.setRole).toHaveBeenCalledWith('user-1', Role.ADMIN);
      expect(result).toEqual(user);
    });
  });
});
