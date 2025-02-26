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
    it('should return 201 if post created successfully', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      userApi.getUserById.mockResolvedValue({ verified: true });

      let title = 'valid title';
      let content = 'valid content';
      const response = await request(app).post('/publish').send({ title: title, content: content });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Post published');
      expect(response.body.post.content).toBe(content);
      expect(response.body.post.title).toBe(title); // Ensure title is included
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
        title: 'Test Post',
        content: 'Some test content',
        reactions: mockReactions,
      });

      postsApi.getALlReactionsFromPost.mockResolvedValue(mockReactions);

      const response = await request(app).get(`/reactions/${existentPostId}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ reactions: mockReactions });
    });
  });
});
