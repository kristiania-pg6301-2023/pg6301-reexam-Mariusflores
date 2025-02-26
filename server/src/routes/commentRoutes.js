import express from 'express';
import { getUserFromSession } from '../utils/sessionUtils.js';
import sanitizeHtml from 'sanitize-html';
import { ObjectId } from 'mongodb';
import {
  sanitizeContent,
  validatePostExists,
  validatePostId,
  validateUserSession,
} from './postRoutes.js';
import { getPostById } from '../apis/postsApi.js';
import { db } from '../config/db.js';
import { createComment, getAllCommentsByPostId } from '../apis/commentApi.js';

const router = express.Router();

router.post('/:postId', async (req, res) => {
  try {
    console.log('recieved request');
    console.log('validating user');
    const userId = validateUserSession(req, res);

    if (!userId) return;

    const postId = req.params.postId;
    console.log('validating postId');
    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);

    console.log('validating post exists');
    if (!validatePostExists(post, res)) return;

    const { content } = req.body;

    const sanitizedContent = sanitizeContent(content);

    if (sanitizedContent.length > 300) {
      return res.status(400).json({ message: 'Comment exceeds maximum limit' });
    }

    const newComment = await createComment(db, postId, userId, sanitizedContent);
    console.log('post created');
    return res.status(201).json({ message: 'Successfully commented', comment: newComment });
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    console.log('Error creating comment:', error);
  }
});

router.get('/:postId', async (req, res) => {
  try {
    console.log('recieved request');
    const userId = validateUserSession(req, res);
    const postId = req.params.postId;

    console.log('Validating postid:', postId);
    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    console.log('Validating post');

    if (!validatePostExists(post, res)) return;

    console.log('fetching comments');

    const postComments = await getAllCommentsByPostId(db, postId);

    res.json({ comments: postComments });
    console.log('sent comments:', postComments);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
    console.log('Error fetching comments:', error);
  }
});

export default router;
