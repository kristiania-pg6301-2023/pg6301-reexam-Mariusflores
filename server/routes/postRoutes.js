import sanitizeHtml from 'sanitize-html';
import {
  addReactionToPost,
  createPost,
  deletePostById,
  editPostById,
  getAllPosts,
  getAllPostsFromUser,
  getPostById,
} from '../apis/postsApi.js';
import { db } from '../config/db.js';
import express from 'express';
import { ObjectId } from 'mongodb';
import { getUserFromSession } from '../utils/sessionUtils.js';

const router = express.Router();

/**
 * Helper functions
 */

const sanitizeContent = (content) => {
  return sanitizeHtml(content.trim(), { allowedTags: [], allowedAttributes: {} });
};

const validateUserSession = (req, res) => {
  const userId = getUserFromSession(req);
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
    return null;
  }
  return userId;
};

const validatePostId = (postId, res) => {
  if (!ObjectId.isValid(postId)) {
    res.status(400).json({ message: 'Invalid post ID' });
    return false;
  }
  return true;
};

/**
 * POST Requests
 * */

/**
 * Creates a post in database
 */
router.post('/publish', async (req, res) => {
  try {
    const userId = validateUserSession(req, res);
    if (!userId) return;

    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content required' });
    }

    // Sanitize the content
    const sanitizedContent = sanitizeContent(content);
    if (sanitizedContent.length > 1000) {
      return res.status(400).json({ message: 'Post exceeds maximum limit' });
    }

    // Create post
    const newPost = await createPost(db, userId, sanitizedContent);
    res.status(201).json({ message: 'Post published', post: newPost });
    console.log('Created post');
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * Delete post by postId
 * Validates that post is from authenticated user
 * Disallows deleting someone else's post
 */
router.post('/delete/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = validateUserSession(req, res);
    if (!userId) return;

    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (userId.toString() !== post.userid.toString()) {
      return res.status(403).json({ message: "Cannot delete someone else's post" });
    }

    await deletePostById(db, new ObjectId(postId));
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Route to edit post content
 */
router.post('/edit/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { newContent } = req.body;
    const userId = validateUserSession(req, res);
    if (!userId) return;

    if (!newContent) {
      return res.status(400).json({ message: 'Content required' });
    }

    // Sanitize the content
    const sanitizedContent = sanitizeContent(newContent);
    if (sanitizedContent.length > 1000) {
      return res.status(400).json({ message: 'Post exceeds maximum limit' });
    }

    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (userId.toString() !== post.userid.toString()) {
      return res.status(403).json({ message: "Cannot edit someone else's post" });
    }

    await editPostById(db, postId, sanitizedContent);
    return res.status(200).json({ message: 'Post edited successfully' });
  } catch (error) {
    console.error('Error editing post', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Route to react to a post
 */
router.post('/react/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { reaction } = req.body;
    const userId = validateUserSession(req, res);
    if (!userId) return;

    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    console.log('checking if user has reacted..');
    if (post.reactions.some((r) => r.userId === userId)) {
      return res.status(409).json({ message: 'You can only react to a post once' });
    }

    console.log('checked if user has reacted');
    await addReactionToPost(db, postId, userId, reaction);
    return res.status(200).json({ message: 'Successfully added reaction' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Get Requests
 */

/**
 * Get all posts
 */
router.get('/all', async (req, res) => {
  try {
    const posts = await getAllPosts(db);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

/**
 * Get post by specific user
 */
router.get('/user/posts/:userid?', async (req, res) => {
  try {
    // Dual use case, for fetching logged-in users posts, as well as other peoples posts
    let userId = req.params.userid || getUserFromSession(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in' });
    }

    const userPosts = await getAllPostsFromUser(db, userId);
    res.json(userPosts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

export default router;
