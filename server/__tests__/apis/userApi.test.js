import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  createUser,
  findOrCreateUser,
  getUserById,
  getUserByUsername,
  setVerified,
  updateUsername,
} from '@/apis/userApi.js';

let mongod;
let connection;
let db;

beforeAll(async () => {
  // in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  connection = new MongoClient(uri);
  await connection.connect();
  db = connection.db('testdb');
});

afterAll(async () => {
  await connection.close();
  await mongod.stop();
});

beforeEach(async () => {
  await db.collection('users').deleteMany({});
});

describe('createUser', () => {
  it('should create a new user', async () => {
    await createUser(db, 'user1', 'testUser', 'testPassword', 'test@test.com');

    const user = await getUserByUsername(db, 'testUser');

    expect(user).not.toBe(null);
    expect(user.id).toBe('user1');
  });
});

describe('updateUsername', () => {
  it('should should update username', async () => {
    await createUser(db, 'user1', 'testUser', 'testPassword', 'test@test.com');

    const result = await updateUsername(db, 'user1', 'newUsername');

    expect(result.modifiedCount).toBe(1);

    const updatedUser = await getUserById(db, 'user1');

    expect(updatedUser.username).toBe('newUsername');
  });
});

describe('verified', () => {
  it('should make user verified', async () => {
    await createUser(db, 'user1', 'testUser', 'testPassword', 'test@test.com');

    const result = await setVerified(db, 'user1');

    expect(result.modifiedCount).toBe(1);

    const verifiedUser = await getUserById(db, 'user1');

    expect(verifiedUser.verified).toBe(true);
  });
});

describe('findOrCreateUser', () => {
  it('should create new user if not found in db', async () => {
    const mockProfile = {
      id: '19203',
      displayName: 'TestUser',
      emails: [{ value: 'testuser@example.com' }],
    };
    const provider = 'google';

    const user = await findOrCreateUser(db, mockProfile, provider);

    expect(user).toBeDefined;
    expect(user.id).toBe(`${provider}:${mockProfile.id}`);
    expect(user.username).toBe(mockProfile.displayName);
    expect(user.email).toBe(mockProfile.emails[0].value);
    expect(user.provider).toBe(provider);

    const foundUser = await getUserById(db, user.id);
    expect(foundUser).toBeDefined();
    expect(foundUser.id).toBe(user.id);
  });

  it('should return an existing user without creating a new one', async () => {
    const mockProfile = {
      id: '19203',
      displayName: 'TestUser',
      emails: [{ value: 'testuser@example.com' }],
    };
    const provider = 'google';
    const userId = `${provider}:${mockProfile.id}`;

    await db.collection('users').insertOne({
      id: userId,
      username: mockProfile.displayName,
      email: mockProfile.emails[0].value,
      verified: false,
      provider: provider,
      createdAt: new Date(),
    });

    const user = await findOrCreateUser(db, mockProfile, provider);

    const userCount = await db.collection('users').countDocuments({ id: userId });

    expect(userCount).toBe(1);

    expect(user.id).toBe(userId);
    expect(user.username).toBe(mockProfile.displayName);
  });

  it('should assign default email if the profile has none', async () => {
    const mockProfile = {
      id: '2345534',
      displayName: 'UserWithoutEmail',
    };

    const provider = 'github';

    const user = await findOrCreateUser(db, mockProfile, provider);

    expect(user.email).toBe(`no-email@${provider}.com`);
  });

  it('should handle missing display name in OAuth profile', async () => {
    const mockProfile = {
      id: '67890',
      emails: [{ value: 'userwithoutname@example.com' }],
    };
    const provider = 'github';

    const user = await findOrCreateUser(db, mockProfile, provider);

    expect(user.username).not.toBe(null);
    expect(user.username).toContain('user:');
  });
});
