import sanitizeHtml from 'sanitize-html';
import { createPost } from '../apis/postsApi.js';
import { db } from '../config/db.js';
import express from 'express';

const router = express.Router();

router.post("/publish", async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null; // Extract user ID from session (if using Passport.js)

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content required" });
    }

    // Sanitize the content
    const sanitizedContent = sanitizeHtml(content.trim(), {
      allowedTags: [],
      allowedAttributes: {},
    });

    if (sanitizedContent.length > 1000) {
      return res.status(400).json({ message: "Post exceeds maximum limit" });
    }

    // Create post
    const newPost = await createPost(db,  userId, sanitizedContent );

    res.status(201).json({ message: "Post published", post: newPost });
    console.log("Created post");

  } catch (error) {
    console.error("Error publishing post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/all", async (req, res) => {

})


export default router;