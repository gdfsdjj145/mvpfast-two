import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  authorize: null as null | ((credentials: Record<string, string>) => Promise<unknown>),
  verifyCode: vi.fn(),
  findUser: vi.fn(),
}));

vi.mock('next-auth', () => ({
  default: (config: { providers: Array<{ authorize: typeof mocks.authorize }> }) => {
    mocks.authorize = config.providers[0].authorize;
    return { handlers: {}, signIn: vi.fn(), signOut: vi.fn(), auth: vi.fn() };
  },
}));
vi.mock('next-auth/providers/credentials', () => ({ default: (options: unknown) => options }));
vi.mock('@next-auth/prisma-adapter', () => ({ PrismaAdapter: () => ({}) }));
vi.mock('@/lib/core/prisma', () => ({
  default: { user: { findUnique: mocks.findUser, findFirst: vi.fn() } },
}));
vi.mock('@/app/(main)/[local]/auth/signin/actions', () => ({
  verifyCode: mocks.verifyCode,
  verifyPasswordLogin: vi.fn(),
}));
vi.mock('@/models/credit', () => ({ grantInitialCredits: vi.fn() }));
vi.mock('@/lib/utils/name-generator', () => ({ getGeneratorName: () => 'test-user' }));

await import('@/auth');

describe('微信凭证登录', () => {
  beforeEach(() => {
    mocks.verifyCode.mockReset();
    mocks.findUser.mockReset();
  });

  it('拒绝仅凭 OpenID 登录，并要求一次性票据通过验证', async () => {
    const authorize = mocks.authorize;
    if (!authorize) throw new Error('NextAuth authorize 未初始化');

    expect(await authorize({ type: 'wx', identifier: 'victim-openid', code: '' })).toBeNull();
    expect(mocks.findUser).not.toHaveBeenCalled();

    mocks.verifyCode.mockResolvedValueOnce(false);
    expect(await authorize({ type: 'wx_ticket', identifier: 'user-id', code: 'invalid' })).toBeNull();
    expect(mocks.findUser).not.toHaveBeenCalled();

    const user = { id: 'user-id', email: null, phone: null, wechatOpenId: 'victim-openid', nickName: 'test', avatar: null };
    mocks.verifyCode.mockResolvedValueOnce(true);
    mocks.findUser.mockResolvedValueOnce(user);
    expect(await authorize({ type: 'wx_ticket', identifier: 'user-id', code: 'valid-once' })).toEqual(user);
  });
});
