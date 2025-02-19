import sanitizeHtml from 'sanitize-html';
import {
  createPost,
  deletePostById, editPostById,
  getAllPosts,
  getAllPostsFromUser,
  getPostById,
} from '../apis/postsApi.js';
import { db } from '../config/db.js';
import express from 'express';
import { ObjectId } from 'mongodb';

const router = express.Router();

/**
 * Extracts logged in user from session
 * */
function extractUser(req) {
  return req.user ? req.user.id : null;
}

/**
 * POST Requests
 * */

/**
 * Creates a post in database
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


/**
 * Delete post by postId
 * Validates that post is from authenticated user
 * Disallows deleting someone else's post
 * */
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
      return res.status(403).json({ message: "Cannot delete someone else's post" });
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
 * Route to edit post content
 * */

router.post('/edit/:postId', async (req, res) => {

  try {
    const postId = req.params.postId;
    const { newContent } = req.body;
    const userid = extractUser(req);

    if (!userid) {
      return res.status(401).json("Unauthorized. Please log in.")
    }
    if (!newContent) {
      return res.status(400).json({ message: 'Content required' });
    }

    // Sanitize the content
    const sanitizedContent = sanitizeHtml(newContent.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    });

    if (sanitizedContent.length > 1000) {
      return res.status(400).json({ message: 'Post exceeds maximum limit' });
    }

    // validate post id
    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    const post = await getPostById(db, postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (userid.toString() !== post.userid.toString()) {
      return res.status(403).json({ message: "Cannot edit someone else's post" });
    }
    //edit post
    await editPostById(db, postId, newContent);
    return res.status(200).json({message: "Post edited successfully"});
  }catch (error) {
    console.error('Error editing post', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
})

/**
 * Get Requests
 * */

/**
 * Get all posts
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

/**
 * Get post by specific user
 * */
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
