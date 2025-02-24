import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import passport from '../config/passport.js';
import { db } from '../config/db.js';
import { getUserByUsername, findOrCreateUser, getUserById } from '../apis/userApi.js';
import { verifyPassword } from '../utils/authHelpers.js';

// Mock dependencies
vi.mock('../apis/userApi.js', () => ({
  getUserByUsername: vi.fn(),
  findOrCreateUser: vi.fn(),
  getUserById: vi.fn(),
}));

vi.mock('../utils/authHelpers.js', () => ({
  verifyPassword: vi.fn(),
}));

describe('Passport Authentication', () => {
  let done, req, res, next;

  beforeEach(() => {
    done = vi.fn();
    req = { session: {}, login: vi.fn((user, cb) => cb()) };
    res = { setHeader: vi.fn(), redirect: vi.fn(), end: vi.fn() };
    next = vi.fn();
  });

  afterEach(() => vi.restoreAllMocks());

  /*** 🟢 LOCAL STRATEGY TEST ***/
  /*
  it('authenticates user with correct credentials', async () => {
    const mockUser = { id: '123', username: 'testuser', password: 'hashedpassword' };

    getUserByUsername.mockResolvedValue(mockUser);
    verifyPassword.mockResolvedValue(true);

    await new Promise((resolve) => passport.authenticate('local', (err, user) => {
      done(err, user);
      resolve();
    })(req, res, next));

    expect(getUserByUsername).toHaveBeenCalledWith(db, 'testuser');
    expect(verifyPassword).toHaveBeenCalledWith(mockUser, 'password');
    expect(done).toHaveBeenCalledWith(null, mockUser);
  });

   */

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
