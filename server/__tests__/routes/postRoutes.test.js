import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import postRouter from '../../src/routes/postRoutes.js'; // Adjust path if needed
import * as sessionUtils from '../../src/utils/sessionUtils.js';
import * as postsApi from '../../src/apis/postsApi.js';
import * as userApi from '../../src/apis/userApi.js';

// Mock Express app
const app = express();
app.use(express.json());
app.use('/', postRouter);

// Mock session utility
vi.spyOn(sessionUtils, 'getUserFromSession');

// Mock database API calls
vi.spyOn(postsApi, 'getPostById');
vi.spyOn(postsApi, 'getAllPosts');
vi.spyOn(postsApi, 'getAllPostsFromUser');
vi.spyOn(postsApi, 'getALlReactionsFromPost');
vi.spyOn(postsApi, 'createPost');
vi.spyOn(postsApi, 'deletePostById');
vi.spyOn(postsApi, 'addReactionToPost');
vi.spyOn(postsApi, 'removeReactionFromPost');
vi.spyOn(postsApi, 'updateReactionInPost'); // Removed duplicate
vi.spyOn(userApi, 'getUserById');

describe('Post routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /publish', () => {
    it('should return 401 if user not logged in', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).post('/publish').send({ content: 'new post' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in.');
    });

    it('should return 401 if user not verified', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      userApi.getUserById.mockResolvedValue({ verified: false });

      const response = await request(app).post('/publish').send({ content: 'test not verified' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('You have to be verified to post');
    });

    it('should return 400 if content is empty', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      userApi.getUserById.mockResolvedValue({ verified: true });

      const response = await request(app).post('/publish').send(null);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Content and title required');
    });

    it('should return 400 if content exceeds limit', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      userApi.getUserById.mockResolvedValue({ verified: true });

      let overLimitString = 'a'.repeat(1001);
      let title = 'some title';

      const response = await request(app)
        .post('/publish')
        .send({ title: title, content: overLimitString });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Content exceeds maximum limit');
    });

    it('should return 400 if title exceeds limit', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      userApi.getUserById.mockResolvedValue({ verified: true });

      let overLimitString = 'a'.repeat(201);
      let content = 'some content';

      const response = await request(app)
        .post('/publish')
        .send({ title: overLimitString, content: content });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Title exceeds maximum limit');
    });

    it('should return 201 if post created successfully', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      userApi.getUserById.mockResolvedValue({ verified: true });

      postsApi.createPost.mockResolvedValue({
        _id: 'mockPostId',
        title: 'valid title',
        content: 'valid content',
        userid: 'user1',
      });

      let title = 'valid title';
      let content = 'valid content';
      const response = await request(app).post('/publish').send({ title: title, content: content });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Post published');
      expect(response.body.post.content).toBe(content);
    });
  });

  describe('DELETE /delete/:postId', async () => {
    it('should return 401 if user not logged in', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).delete('/delete/12345');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in.');
    });

    it('should return 400 if not valid post id', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      const response = await request(app).delete('/delete/12345');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid post ID');
    });

    it('should return 404 if post does not exist', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      // Pass a valid but non-existent ObjectId
      const nonExistentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';

      postsApi.getPostById.mockResolvedValue(null); // Mock: Post not found

      const response = await request(app).delete(`/delete/${nonExistentPostId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 403 if user not owner of post', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      postsApi.getPostById.mockResolvedValue({ userid: 'differentUser' });

      const nonExistentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      const response = await request(app).delete(`/delete/${nonExistentPostId}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Cannot delete someone else's post");
    });

    it('should return 200 for successful delete', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      postsApi.getPostById.mockResolvedValue({ userid: 'user1', _id: existentPostId });

      const response = await request(app).delete(`/delete/${existentPostId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post deleted');
    });
  });

  describe('POST /edit/:postId', () => {
    it('should return 401 if user not logged in', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).post('/edit/12345').send({ newContent: 'edited post' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in.');
    });

    it('should return 400 if not valid post id', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      const response = await request(app).post('/edit/12345').send({ newContent: 'edited post' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid post ID');
    });

    it('should return 404 if post does not exist', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      // Pass a valid but non-existent ObjectId
      const nonExistentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';

      postsApi.getPostById.mockResolvedValue(null); // Mock: Post not found

      const response = await request(app)
        .post(`/edit/${nonExistentPostId}`)
        .send({ newContent: 'edited post' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 403 if user not owner of post', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      postsApi.getPostById.mockResolvedValue({ userid: 'differentUser' });

      const nonExistentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      const response = await request(app)
        .post(`/edit/${nonExistentPostId}`)
        .send({ newContent: 'edited post' });

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Cannot edit someone else's post");
    });

    it('should return 400 if content is empty', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      postsApi.getPostById.mockResolvedValue({ userid: 'user1', postId: existentPostId });

      const response = await request(app).post(`/edit/${existentPostId}`).send(null);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Content required');
    });

    it('should return 400 if content exceeds limit', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      postsApi.getPostById.mockResolvedValue({ userid: 'user1', postId: existentPostId });

      let overLimitString = 'a'.repeat(1001);

      const response = await request(app)
        .post(`/edit/${existentPostId}`)
        .send({ newContent: overLimitString });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Post exceeds maximum limit');
    });

    it('should return 200 on successful update', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      postsApi.getPostById.mockResolvedValue({ userid: 'user1', postId: existentPostId });

      const response = await request(app)
        .post(`/edit/${existentPostId}`)
        .send({ newContent: 'Successful post edit' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Post edited successfully');
    });
  });

  describe('POST /react/:postId', () => {
    it('should return 401 if user not logged in', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).post('/react/12345');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in.');
    });

    it('should return 400 if not valid post id', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      const response = await request(app).post('/react/12345');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid post ID');
    });

    it('should return 404 if post does not exist', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      // Pass a valid but non-existent ObjectId
      const nonExistentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';

      postsApi.getPostById.mockResolvedValue(null); // Mock: Post not found

      const response = await request(app).post(`/react/${nonExistentPostId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 200 (removed) if reaction exists', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      // Mock user has already made identical reaction
      postsApi.getPostById.mockResolvedValue({
        postId: existentPostId,
        reactions: [{ userId: 'user1', reaction: 'like' }],
      });

      const response = await request(app)
        .post(`/react/${existentPostId}`)
        .send({ reaction: 'like' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reaction removed');
    });

    it('should return 200 (updated) if user reacted with different reaction', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      // Mock user has already made other reaction
      postsApi.getPostById.mockResolvedValue({
        postId: existentPostId,
        reactions: [{ userId: 'user1', reaction: 'like' }],
      });

      const response = await request(app)
        .post(`/react/${existentPostId}`)
        .send({ reaction: 'sad' });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Reaction updated');
    });

    it('should return 201 (created) if user has no existing reactions to post', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      // Mock user has already made other reaction
      postsApi.getPostById.mockResolvedValue({ postId: existentPostId, reactions: [] });

      const response = await request(app)
        .post(`/react/${existentPostId}`)
        .send({ reaction: 'like' });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Successfully added reaction');
    });
  });
  describe('GET /all', () => {
    it('should return 200 and a list of posts', async () => {
      const mockPosts = [
        { postId: '123', title: 'First Post', content: 'Hello World', reactions: [] },
        { postId: '321', title: 'Second Post', content: 'Not Hello World', reactions: [] },
      ];
      postsApi.getAllPosts.mockResolvedValue(mockPosts);

      const response = await request(app).get('/all');
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
    });
  });
  describe('GET /user/posts/:userid?', () => {
    it('should return 401 if user not logged in', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).get('/user/posts');
      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in');
    });

    it("should return 200 and a list of logged in user's posts", async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      const mockPosts = [
        { userid: 'user1', title: 'First Post', content: 'my first post' },
        { userid: 'user1', title: 'Second Post', content: 'my second post' },
        { userid: 'user1', title: 'Last Post', content: 'my last post' },
      ];

      postsApi.getAllPostsFromUser.mockResolvedValue(mockPosts);

      const response = await request(app).get('/user/posts');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
    });

    it('should return 200 and a list of posts from another user', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      const mockPosts = [
        { userid: 'user2', title: 'Another User First Post', content: 'my first post' },
        { userid: 'user2', title: 'Another User Second Post', content: 'my second post' },
        { userid: 'user2', title: 'Another User Last Post', content: 'my last post' },
      ];

      postsApi.getAllPostsFromUser.mockResolvedValue(mockPosts);

      const response = await request(app).get('/user/posts/user2');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockPosts);
    });
  });

  describe('GET /reactions/:postId', () => {
    it('should return 401 if user not logged in', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).get('/reactions/12345');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in.');
    });

    it('should return 400 if not valid post id', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      postsApi.getPostById.mockResolvedValue('1234');

      const response = await request(app).get('/reactions/1234');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid post ID');
    });

    it('should return 404 if posts dont exist', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      postsApi.getPostById.mockResolvedValue(null);

      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';

      const response = await request(app).get(`/reactions/${existentPostId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 200 and a list of reactions', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';

      const mockReactions = [
        { userId: 'user2', username: 'testuser', reaction: 'like' },
        { userId: 'user4', username: 'testuser', reaction: 'sad' },
        { userId: 'user3', username: 'testuser', reaction: 'laugh' },
      ];

      postsApi.getPostById.mockResolvedValue({
        postId: existentPostId,

        reactions: mockReactions,
      });

      postsApi.getALlReactionsFromPost.mockResolvedValue(mockReactions);

      const response = await request(app).get(`/reactions/${existentPostId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ reactions: mockReactions });
    });
  });
});
