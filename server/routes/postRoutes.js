import sanitizeHtml from 'sanitize-html';
import { createPost, deletePostById, getAllPosts, getAllPostsFromUser, getPostById } from '../apis/postsApi.js';
import { db } from '../config/db.js';
import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

// Extract user ID from session
function extractUser(req) {
  return req.user ? req.user.id : null;
}

/**
 * POST Requests
 * */

router.post('/publish', async (req, res) => {
  try {
    const userId = extractUser(req);

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized. Please log in.' });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: 'Content required' });
    }

    // Sanitize the content
    const sanitizedContent = sanitizeHtml(content.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    });

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

router.post('/delete/:postId', async (req, res) => {
  try {
    const postId = req.params.postId;
    const userid = extractUser(req);

    if (!userid) {
      return res.status(401).json({ message: 'Unauthorized. Please log in' });
    }

    // Validate postId
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Check if post exists
    const post = await getPostById(db, postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (userid.toString() !== post.userid.toString()) {
      return res.status(403).json({ message: 'Cannot delete someone else\'s post' });
    }
    //delete post
    await deletePostById(db, new ObjectId(postId));
    res.status(200).json({ message: 'Post deleted' });

  } catch (error) {
    console.error('Error deleting post', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Get Requests
 * */

router.get('/all', async (req, res) => {
  try {
    const posts = await getAllPosts(db);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

router.get('/user/posts/:userid?', async (req, res) => {
  try {
    //Dual use case, for fetching logged-in users posts, as well as other peoples posts
    let userid = req.params.userid || extractUser(req);

    if (!userid) {
      return res.status(401).json({ message: 'Uauthorized. Please log in' });
    }
    const userPosts = await getAllPostsFromUser(db, userid);
    res.json(userPosts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

/**
 * Delete requests
 * */




export default router;