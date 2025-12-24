import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma client - use inline mock to avoid hoisting issues
vi.mock('@/lib/prisma', () => ({
  default: {
    user: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

// Import after mocking
import prisma from '@/lib/prisma';
import { createUser, getUserById, findUsers, updateUser, deleteUser } from '@/models/user';

describe('User Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user with required fields', async () => {
      const userData = {
        nickName: '测试用户',
        email: 'test@example.com',
      };

      const mockCreatedUser = {
        id: '1',
        ...userData,
        created_time: new Date(),
      };

      vi.mocked(prisma.user.create).mockResolvedValue(mockCreatedUser as never);

      const result = await createUser(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          nickName: userData.nickName,
          email: userData.email,
          created_time: expect.any(Date),
        }),
      });
      expect(result).toEqual(mockCreatedUser);
    });

    it('should create a user with phone number', async () => {
      const userData = {
        nickName: '手机用户',
        phone: '13800138000',
      };

      vi.mocked(prisma.user.create).mockResolvedValue({
        id: '2',
        ...userData,
        created_time: new Date(),
      } as never);

      await createUser(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          phone: userData.phone,
        }),
      });
    });

    it('should create a user with WeChat OpenID', async () => {
      const userData = {
        nickName: '微信用户',
        wechatOpenId: 'wx_openid_123',
        avatar: 'https://example.com/avatar.jpg',
      };

      vi.mocked(prisma.user.create).mockResolvedValue({
        id: '3',
        ...userData,
        created_time: new Date(),
      } as never);

      await createUser(userData);

      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          wechatOpenId: userData.wechatOpenId,
          avatar: userData.avatar,
        }),
      });
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '1',
        nickName: '测试用户',
        email: 'test@example.com',
        created_time: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);

      const result = await getUserById('1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when user not found', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);

      const result = await getUserById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findUsers', () => {
    it('should find users with default pagination', async () => {
      const mockUsers = [
        { id: '1', nickName: '用户1' },
        { id: '2', nickName: '用户2' },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as never);

      const result = await findUsers({ nickName: '用户' });

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { nickName: '用户' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual(mockUsers);
    });

    it('should find users with custom pagination', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([] as never);

      await findUsers({ email: 'test@example.com' }, 10, 20);

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        skip: 10,
        take: 20,
      });
    });
  });

  describe('updateUser', () => {
    it('should update user information', async () => {
      const mockUpdatedUser = {
        id: '1',
        nickName: '更新后的用户',
        email: 'updated@example.com',
      };

      vi.mocked(prisma.user.update).mockResolvedValue(mockUpdatedUser as never);

      const result = await updateUser('1', { nickName: '更新后的用户' });

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { nickName: '更新后的用户' },
      });
      expect(result).toEqual(mockUpdatedUser);
    });
  });

  describe('deleteUser', () => {
    it('should delete user by id', async () => {
      const mockDeletedUser = {
        id: '1',
        nickName: '被删除的用户',
      };

      vi.mocked(prisma.user.delete).mockResolvedValue(mockDeletedUser as never);

      const result = await deleteUser('1');

      expect(prisma.user.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(mockDeletedUser);
    });
  });
});
