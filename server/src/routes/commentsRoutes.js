import express from 'express';
import { ObjectId } from 'mongodb';
import { sanitizeContent, validatePostExists, validatePostId } from './postRoutes.js';
import { getPostById } from '../apis/postsApi.js';
import { db } from '../config/db.js';
import {
  createComment,
  deleteCommentById,
  getAllCommentsByPostId,
  getCommentById,
} from '../apis/commentsApi.js';
import { getUserFromSession } from '../utils/sessionUtils.js';

const router = express.Router();

/**
 * Helper functions
 * */

export const validateUserSession = (req, res) => {
  const userId = getUserFromSession(req);
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. Please log in.' });

    return null; // ✅ Ensures null is returned to stop execution
  }
  return userId;
};

/**
 * Post Requests
 * */
router.post('/:postId', async (req, res) => {
  try {
    const userId = validateUserSession(req, res);

    if (!userId) return;

    const postId = req.params.postId;

    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);

    if (!validatePostExists(post, res)) return;
    console.log('post exists', postId);
    const { content } = req.body;

    const sanitizedContent = sanitizeContent(content);

    console.log('Checking comment length');
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

/**
 * Get requests
 * */
router.get('/:postId', async (req, res) => {
  try {
    console.log('recieved request');
    const userId = validateUserSession(req, res);
    const postId = req.params.postId;

    if (!userId) return;

    console.log('Validating postid:', postId);
    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    console.log('post found', post);

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

/**
 * Delete requests
 * */
router.delete('/delete/:commentId', async (req, res) => {
  try {
    const userId = validateUserSession(req, res);

    if (!userId) return;

    const commentId = req.params.commentId;
    if (!ObjectId.isValid(commentId)) {
      res.status(400).json({ message: 'Invalid comment ID' });
      return;
    }

    const comment = await getCommentById(db, commentId);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    if (comment.userId !== userId) {
      res.status(403).json({ message: "You cannot delete someone else's comments" });
      return;
    }

    await deleteCommentById(db, commentId);
    res.status(200).json({ message: 'Comment deleted.' });
  } catch (error) {
    console.log('Error deleting comment:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
