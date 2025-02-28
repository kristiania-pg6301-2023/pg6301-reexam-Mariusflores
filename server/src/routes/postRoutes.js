import sanitizeHtml from 'sanitize-html';
import {
  addReactionToPost,
  createPost,
  deletePostById,
  editPostById,
  getAllPosts,
  getAllPostsFromUser,
  getALlReactionsFromPost,
  getPostById,
  getPostCount,
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
 * exported for use in commentsRoutes.js
 */

export const sanitizeContent = (content) => {
  return sanitizeHtml(content.trim(), { allowedTags: [], allowedAttributes: {} });
};

export const validateUserSession = (req, res) => {
  const userId = getUserFromSession(req);
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized. Please log in.' });
    return null;
  }
  return userId;
};

export const validatePostId = (postId, res) => {
  if (!ObjectId.isValid(postId)) {
    res.status(400).json({ message: 'Invalid post ID' });
    return false;
  }
  return true;
};

export const validatePostExists = (post, res) => {
  if (!post) {
    res.status(404).json({ message: 'Post not found' });
    return false;
  }
  return true;
};

/**
 * POST Requests
 */

/**
 * Creates a post in the database
 */
router.post('/publish', async (req, res) => {
  try {
    const userId = validateUserSession(req, res);
    if (!userId) return;

    const user = await getUserById(db, userId);
    if (!user || !user.verified) {
      return res.status(401).json({ message: 'You have to be verified to post' });
    }

    //Validate user has not posted 5 times in an hour

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const postCount = await getPostCount(userId, oneHourAgo);
    console.log('Post Count', postCount);

    if (postCount >= 5) {
      return res
        .status(429)
        .json({ message: 'Post limit reached. You can only post 5 times per hour.' });
    }

    const { title, content } = req.body;
    if (!content || !title) {
      return res.status(400).json({ message: 'Content and title required' });
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(content);
    if (sanitizedContent.length > 1000) {
      return res.status(400).json({ message: 'Content exceeds maximum limit' });
    }
    if (sanitizedContent.length < 10) {
      return res.status(400).json({ message: 'Content must be 10 or more characters' });
    }

    const sanitizedTitle = sanitizeContent(title);
    if (sanitizedTitle.length > 200) {
      return res.status(400).json({ message: 'Title exceeds maximum limit' });
    }

    // Create post
    const newPost = await createPost(db, userId, sanitizedContent, sanitizedTitle);
    res.status(201).json({ message: 'Post published', post: newPost });
  } catch (error) {
    console.error('Error publishing post:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

/**
 * UPDATE requests
 * */

/**
 * Route to edit post content
 * Patch because it modifies part of the post
 */
router.patch('/edit/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { newContent } = req.body;
    const userId = validateUserSession(req, res);
    if (!userId) return;

    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    if (!validatePostExists(post, res)) return;

    if (userId.toString() !== post.userid.toString()) {
      return res.status(403).json({ message: "Cannot edit someone else's post" });
    }
    if (!newContent) {
      return res.status(400).json({ message: 'Content required' });
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(newContent);
    if (sanitizedContent.length > 1000) {
      return res.status(400).json({ message: 'Post exceeds maximum limit' });
    }
    if (sanitizedContent.length < 10) {
      return res.status(400).json({ message: 'Content must be 10 or more characters' });
    }

    await editPostById(db, postId, sanitizedContent);
    res.status(200).json({ message: 'Post edited successfully' });
  } catch (error) {
    console.error('Error editing post', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Route to react to a post
 * Put because it adds or replaces a reaction in its entirety
 */
router.put('/react/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const { reaction } = req.body;
    const userId = validateUserSession(req, res);
    if (!userId) return;

    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    if (!validatePostExists(post, res)) return;

    // Check existing reaction
    const existingReaction = post.reactions.find((r) => r.userId === userId);

    if (existingReaction) {
      if (existingReaction.reaction === reaction) {
        await removeReactionFromPost(db, postId, userId, reaction);
        return res.status(200).json({ message: 'Reaction removed', userId });
      } else {
        await updateReactionInPost(db, postId, userId, reaction);
        return res.status(200).json({ message: 'Reaction updated', userId });
      }
    } else {
      await addReactionToPost(db, postId, userId, reaction);
      return res.status(201).json({ message: 'Successfully added reaction', userId });
    }
  } catch (error) {
    console.error('Error reacting to post:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * DELETE requests
 * */

/**
 * Delete post by postId
 * Validates that the post belongs to the authenticated user
 */
router.delete('/delete/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = validateUserSession(req, res);
    if (!userId) return;

    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    if (!validatePostExists(post, res)) return;

    if (userId.toString() !== post.userid.toString()) {
      return res.status(403).json({ message: "Cannot delete someone else's post" });
    }

    await deletePostById(db, new ObjectId(postId));
    res.status(200).json({ message: 'Post deleted' });
  } catch (error) {
    console.error('Error deleting post', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * GET Requests
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
 * Get posts by a specific user
 */
router.get('/user/posts/:userid?', async (req, res) => {
  try {
    let userId = req.params.userid || getUserFromSession(req);
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in' });
    }

    const userPosts = await getAllPostsFromUser(db, userId);
    res.json(userPosts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

/**
 * Get reactions from post
 * */

router.get('/reactions/:postId', async (req, res) => {
  try {
    const userId = validateUserSession(req, res);
    if (!userId) return;

    const postId = req.params.postId;

    if (!validatePostId(postId, res)) return;

    const post = await getPostById(db, postId);
    if (!validatePostExists(post, res)) return;

    const postReactions = await getALlReactionsFromPost(db, postId);
    console.log('Post reactions', postReactions);
    res.status(200).json({ reactions: postReactions });
  } catch (error) {
    console.log('An error occurred:', error);
    res.status(500).json({ message: 'Failed to fetch reactions' });
  }
});

export default router;
