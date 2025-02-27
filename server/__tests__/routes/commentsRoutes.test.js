import { beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import commentsRouter from '../../src/routes/commentsRoutes.js'; // Adjust path if needed
import * as sessionUtils from '../../src/utils/sessionUtils.js';
import * as postsApi from '../../src/apis/postsApi.js';
import * as commentsApi from '../../src/apis/commentsApi.js';
import * as userApi from '../../src/apis/userApi.js';

// Mock Express app
const app = express();
app.use(express.json());
app.use('/', commentsRouter);

// Mock session utility
vi.spyOn(sessionUtils, 'getUserFromSession');

vi.spyOn(commentsApi, 'createComment');
vi.spyOn(commentsApi, 'getAllCommentsByPostId');
vi.spyOn(commentsApi, 'getCommentById');
vi.spyOn(commentsApi, 'deleteCommentById');

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

describe('Comment routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /:postId', () => {
    it('should return 401 if user not authenticated', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).post(`/somePostId`).send({ content: 'some content' });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in.');
    });
    it('should return 400 if invalid PostId', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      const response = await request(app).post('/1234').send({ content: 'some comment' });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid post ID');
    });

    it('should return 404 if post does not exist', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const nonExistentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      postsApi.getPostById.mockResolvedValue(null);

      const response = await request(app)
        .post(`/${nonExistentPostId}`)
        .send({ content: 'some comment' });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 400 if comment exceed maximum limit of 300 characters', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      const overLimitString = 'a'.repeat(301);
      postsApi.getPostById.mockResolvedValue({ userid: 'user1', _id: existentPostId });
      const response = await request(app)
        .post(`/${existentPostId}`)
        .send({ content: overLimitString });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Comment exceeds maximum limit');
    });

    it('should return 201 and create post ', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      postsApi.getPostById.mockResolvedValue({ userid: 'user1', _id: existentPostId });

      const existentCommentId = 'b7a40867f4f54e669898b99c';

      const validString = 'Valid comment';

      commentsApi.createComment.mockResolvedValue({
        _id: existentCommentId,
        postId: existentPostId,
        userId: 'user1',
        content: validString,
      });
      const response = await request(app).post(`/${existentPostId}`).send({ content: validString });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Successfully commented');

      const createdComment = response.body.comment;

      expect(createdComment.postId.toString()).toBe(existentPostId);
      expect(createdComment._id.toString()).toBe(existentCommentId);
      expect(createdComment.userId.toString()).toBe('user1');
      expect(createdComment.content).toBe(validString);
    });
  });

  describe('GET /:postId', () => {
    it('should return 401 if user not authenticated', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).get(`/somePostId`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in.');
    });
    it('should return 400 if not valid postId', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      const response = await request(app).get('/1234');

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid post ID');
    });

    it('should return 404 if post doesnt exist', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const nonExistentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      postsApi.getPostById.mockResolvedValue(null);

      const response = await request(app).get(`/${nonExistentPostId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Post not found');
    });

    it('should return 200 and a list of comments', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentPostId = '65c2b1f4a5b3c2d6e9f4a5b3';
      postsApi.getPostById.mockResolvedValue(null);
      postsApi.getPostById.mockResolvedValue({ userid: 'user1', _id: existentPostId });

      const mockComments = [
        { _id: 'someId', postId: existentPostId, userId: 'user1', content: 'some content' },
        {
          _id: 'someOtherId',
          postId: existentPostId,
          userId: 'user1',
          content: 'some other content',
        },
      ];
      commentsApi.getAllCommentsByPostId.mockResolvedValue(mockComments);

      const response = await request(app).get(`/${existentPostId}`);

      expect(response.status).toBe(200);
      const comments = response.body.comments;

      expect(comments).toBeTruthy();

      expect(comments).toEqual(mockComments);
    });
  });

  describe('DELETE /delete/:commentId', () => {
    it('should return 401 if user not authenticated', async () => {
      sessionUtils.getUserFromSession.mockReturnValue(null);

      const response = await request(app).delete(`/delete/someid`);

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Unauthorized. Please log in.');
    });

    it('should return 400 if not valid comment id', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');

      const response = await request(app).delete(`/delete/someid`);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid comment ID');
    });

    it('should return 404 if comment not found', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentCommentId = 'b7a40867f4f54e669898b99c';
      commentsApi.getCommentById.mockResolvedValue(null);

      const response = await request(app).delete(`/delete/${existentCommentId}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Comment not found');
    });

    it('should return 403 if user is not author of comment', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentCommentId = 'b7a40867f4f54e669898b99c';
      commentsApi.getCommentById.mockResolvedValue({ userId: 'other user' });

      const response = await request(app).delete(`/delete/${existentCommentId}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toBe("You cannot delete someone else's comments");
    });

    it('should return 200 and delete comment', async () => {
      sessionUtils.getUserFromSession.mockReturnValue('user1');
      const existentCommentId = 'b7a40867f4f54e669898b99c';
      commentsApi.getCommentById.mockResolvedValue({ userId: 'user1' });

      const response = await request(app).delete(`/delete/${existentCommentId}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Comment deleted.');
    });
  });
});
