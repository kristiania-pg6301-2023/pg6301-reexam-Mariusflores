import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import {
  addReactionToPost,
  createPost,
  deletePostById,
  editPostById,
  getAllPosts,
  getAllPostsFromUser,
  getPostById,
  removeReactionFromPost,
  updateReactionInPost,
} from '../../src/apis/postsApi.js';

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
});

describe('Post Functions', () => {
  it('should create a post and retrieve it by id', async () => {
    const newPost = await createPost(db, 'user1', 'Hello World', 'Hello');
    const fetchedPost = await getPostById(db, newPost._id.toString());

    expect(fetchedPost).toBeTruthy();
    expect(fetchedPost.title).toBe('Hello');
    expect(fetchedPost.content).toBe('Hello World');
    expect(fetchedPost.userid).toBe('user1');
  });
});

describe('getAllPosts', () => {
  it('should perform a lookup and return posts with user details', async () => {
    await db.collection('users').insertOne({
      id: 'user1',
      username: 'testuser',
    });

    await createPost(db, 'user1', 'Post with user lookup', 'User Lookup Post');

    const posts = await getAllPosts(db);
    expect(posts.length).toBe(1);
    expect(posts[0].title).toBe('User Lookup Post');
    expect(posts[0].username).toBe('testuser');
  });
});

describe('getAllPostsFromUser', () => {
  it('should filter posts by user id', async () => {
    await db.collection('users').insertOne({
      id: 'user1',
      username: 'testuser',
    });

    await createPost(db, 'user1', 'User post 1', 'Title 1');
    await createPost(db, 'user1', 'User post 2', 'Title 2');
    await createPost(db, 'user345', 'Other user post', 'Other Title');

    const posts = await getAllPostsFromUser(db, 'user1');
    expect(posts.length).toBe(2);
    posts.forEach((post) => {
      expect(post.username).toBe('testuser');
    });
  });
});

describe('deletePostById', () => {
  it('should delete a post by id', async () => {
    const newPost = await createPost(db, 'user1', 'Post to be deleted', 'Delete Title');
    const deleteResult = await deletePostById(db, newPost._id.toString());

    expect(deleteResult.deletedCount).toBe(1);

    const fetchedPost = await getPostById(db, newPost._id.toString());

    expect(fetchedPost).toBeNull();
  });
});

describe('editPostById', () => {
  it('should update post content', async () => {
    const newPost = await createPost(db, 'user1', 'Post to be edited', 'Edit Title');

    const updateResult = await editPostById(db, newPost._id.toString(), 'Updated post');

    expect(updateResult.modifiedCount).toBe(1);

    const updatedPost = await getPostById(db, newPost._id.toString());

    expect(updatedPost.content).toBe('Updated post');
    expect(updatedPost.title).toBe('Edit Title'); // Ensure title remains unchanged
  });
});

describe('Reactions', () => {
  it('should add a reaction to a post', async () => {
    const newPost = await createPost(db, 'user1', 'Post to get reaction', 'Reaction Title');
    const result = await addReactionToPost(db, newPost._id.toString(), 'user1', 'like');

    expect(result.modifiedCount).toBe(1);

    const updatedPost = await getPostById(db, newPost._id.toString());
    expect(updatedPost.reactions).toEqual([{ userId: 'user1', reaction: 'like' }]);
  });

  it('should remove a reaction from a post', async () => {
    const newPost = await createPost(db, 'user1', 'Post for reaction removal', 'Remove Title');
    await addReactionToPost(db, newPost._id.toString(), 'user1', 'like');
    const result = await removeReactionFromPost(db, newPost._id.toString(), 'user1', 'like');

    expect(result.modifiedCount).toBe(1);

    const updatedPost = await getPostById(db, newPost._id.toString());

    expect(updatedPost.reactions).toEqual([]);
  });

  it('should update a reaction in a post', async () => {
    const newPost = await createPost(
      db,
      'user1',
      'Post to update reaction',
      'Update Reaction Title'
    );
    await addReactionToPost(db, newPost._id.toString(), 'user1', 'like');
    const result = await updateReactionInPost(db, newPost._id.toString(), 'user1', 'sad');

    expect(result.modifiedCount).toBe(1);

    const updatedPost = await getPostById(db, newPost._id.toString());

    expect(updatedPost.reactions).toEqual([{ userId: 'user1', reaction: 'sad' }]);
  });
});
