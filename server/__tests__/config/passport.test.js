import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import passport from '../../src/config/passport.js';
import { db } from '../../src/config/db.js';
import { getUserById, getUserByUsername } from '../../src/apis/userApi.js';
import { verifyPassword } from '../../src/utils/authHelpers.js';
import { Strategy as LocalStrategy } from 'passport-local';

// Mock dependencies
vi.mock('../../src/apis/userApi.js', () => ({
  getUserByUsername: vi.fn(),
  findOrCreateUser: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('../../src/utils/authHelpers.js', () => ({
  verifyPassword: vi.fn(),
}));

describe('Serialize and Deserialize user', () => {
  let done, req, res, next;

  beforeEach(() => {
    done = vi.fn();
    req = { session: {}, login: vi.fn((user, cb) => cb()) };
    res = { setHeader: vi.fn(), redirect: vi.fn(), end: vi.fn() };
    next = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  /*** 🟡 SERIALIZE & DESERIALIZE TESTS ***/
  it('serializes user ID', () => {
    passport.serializeUser({ id: '999' }, done);
    expect(done).toHaveBeenCalledWith(null, '999');
  });

  it('deserializes user correctly', async () => {
    const mockUser = { id: '999', username: 'deserializeUser' };
    getUserById.mockResolvedValue(mockUser);

    await passport.deserializeUser('999', done);

    expect(getUserById).toHaveBeenCalledWith(db, '999');
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

  it('handles error when user is not found', async () => {
    getUserById.mockResolvedValue(null);

    await passport.deserializeUser('nonexistentID', done);

    expect(done.mock.calls[0][0]).toEqual(new Error('User not found')); // ✅ Now correctly matches
  });
});
describe('Passport Authentication - LocalStrategy', () => {
  let strategy;

  beforeEach(() => {
    strategy = new LocalStrategy(
      { usernameField: 'username', passwordField: 'password' },
      async (username, password, done) => {
        try {
          const user = await getUserByUsername(db, username);
          if (!user) return done(null, false, { message: 'User not found' });

          const isValid = await verifyPassword(user, password);
          if (!isValid) return done(null, false, { message: 'Invalid password' });

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    );
  });

  test('should authenticate a valid user', async () => {
    const mockUser = { id: 1, username: 'testuser', password: 'hashedpassword' };
    getUserByUsername.mockResolvedValue(mockUser);
    verifyPassword.mockResolvedValue(true);

    await new Promise((resolve) => {
      strategy.success = (user) => {
        expect(user).toEqual(mockUser);
        resolve();
      };

      strategy.fail = (info) => {
        throw new Error(`Unexpected fail: ${info.message}`);
      };

      strategy.error = (err) => {
        throw err;
      };

      strategy.authenticate({ body: { username: 'testuser', password: 'password' } });
    });
  });
});
