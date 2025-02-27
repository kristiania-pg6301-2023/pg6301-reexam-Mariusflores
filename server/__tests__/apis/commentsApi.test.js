import {
  createComment,
  getCommentById,
  getAllCommentsByPostId,
  deleteCommentById,
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

  it('it should retrieve all comments with user details sorted by latest first', async () => {
    const mockUser1 = { id: 'user1', username: 'Test User' };
    const mockUser2 = { id: 'user2', username: 'Other Test User' };

    await db.collection('users').insertOne(mockUser1);
    await db.collection('users').insertOne(mockUser2);
    const newPost = await createPost(db, 'user1', 'Hello World!', 'Hello');

    await createComment(db, newPost._id.toString(), 'user1', 'Hello Back!');
    await createComment(db, newPost._id.toString(), 'user2', 'Good day!');

    const comments = await getAllCommentsByPostId(db, newPost._id.toString());

    expect(comments).not.toBeNull();
    // Latest entries should be retrieved at the top of array
    expect(comments[0].username).toBe('Other Test User');

    expect(comments[1].content).toBe('Hello Back!');

    expect(new Date(comments[0].timestamp).getTime()).toBeGreaterThan(
      new Date(comments[1].timestamp).getTime()
    );
  });

  it('should delete a comment by id', async () => {
    const mockUser1 = { id: 'user1', username: 'Test User' };

    await db.collection('users').insertOne(mockUser1);

    const newPost = await createPost(db, 'user1', 'Hello World!', 'Hello');

    const newComment = await createComment(db, newPost._id.toString(), 'user1', 'Hello Back!');

    const deleteResult = await deleteCommentById(db, newComment._id.toString());

    expect(deleteResult.deletedCount).toBe(1);

    const fetchedComment = await getCommentById(db, newComment._id.toString());

    expect(fetchedComment).toBeFalsy();
  });
});
