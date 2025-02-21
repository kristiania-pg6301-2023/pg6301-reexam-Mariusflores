import sanitizeHtml from 'sanitize-html';
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
} from '../apis/postsApi.js';
import { db } from '../config/db.js';
import express from 'express';
import { ObjectId } from 'mongodb';
import { getUserFromSession } from '../utils/sessionUtils.js';
import { getUserById } from '../apis/userApi.js';

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

const validatePostExists = (post, res) => {
  if (!post) {
    return res.status(404).json('Post not found');
  }
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

    const user = await getUserById(db, userId);
    if (!user.verified) {
      return res.status(401).json('You have to be verified to post');
    }

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
    validatePostExists(post, res);

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
    validatePostExists(post, res);

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
    validatePostExists(post, res);

    // Find if the user has already reacted
    const existingReaction = post.reactions.find((r) => r.userId === userId);

    console.log('Current post reactions:', post.reactions);
    console.log('Checking existing reaction', existingReaction);

    if (existingReaction) {
      // If the user clicked on the same reaction, remove it
      if (existingReaction.reaction === reaction) {
        console.log('Removing existing reaction', existingReaction);
        await removeReactionFromPost(db, postId, userId, reaction);
        return res.status(200).json({ message: 'Reaction removed', userId });
      } else {
        // If the user clicked a different reaction, update it
        console.log('Updating reaction', existingReaction);
        await updateReactionInPost(db, postId, userId, reaction);
        return res.status(200).json({ message: 'Reaction updated', userId });
      }
    } else {
      // If the user hasn't reacted yet, add the new reaction
      console.log('Adding new reaction', reaction);
      await addReactionToPost(db, postId, userId, reaction);
      return res.status(200).json({ message: 'Successfully added reaction', userId });
    }
  } catch (error) {
    console.error('Error reacting to post:', error);
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
    console.log('An error occurred:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

export default router;
