import {
  createComment,
  getCommentById,
  getAllCommentsByPostId,
} from '../../src/apis/commentApi.js';

import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createPost } from '../../src/apis/postsApi.js';

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
  await db.collection('posts').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('comments').deleteMany({});
});

describe('Comment Functions', () => {
  it('should create new comment', async () => {
    const mockUser = { id: 'user1', username: 'Test User' };

    await db.collection('users').insertOne(mockUser);
    const newPost = await createPost(db, 'user1', 'Hello World!', 'Hello');

    const newComment = await createComment(db, newPost._id.toString(), mockUser.id, 'Hello back!');

    expect(newComment).toBeTruthy();
    expect(newComment.postId.toString()).toBe(newPost._id.toString());
    expect(newComment.userId).toBe('user1');
    expect(newComment.content).toBe('Hello back!');
    expect(newComment.reactions).toEqual([]);
  });
});
