/**
 * Create a comment
 * */
import { ObjectId } from 'mongodb';

export async function createComment(db, postId, userId, content) {
  const newComment = {
    postId: new ObjectId(postId),
    userId: userId,
    content: content,
    timestamp: new Date(),
    reactions: [],
  };

  await db.collection('comments').insertOne(newComment);
  return newComment;
}

export async function getAllCommentsByPostId(db, postId) {
  console.log('filtering comments by postId:', postId);

  return await db
    .collection('comments')
    .aggregate([
      {
        $match: { postId: new ObjectId(postId) }, // Filter by postId
      },
      {
        $lookup: {
          from: 'users', // Name of the users collection
          localField: 'userId', // Field in comments collection
          foreignField: 'id', // Matching field in users collection
          as: 'user', // Resulting field (array)
        },
      },
      {
        $unwind: '$user', // Convert array to object (each comment has 1 user)
      },
      {
        $project: {
          _id: 1, // Keep comment ID
          content: 1, // Include content
          timestamp: 1, // Include timestamp
          username: '$user.username', // Extract username from joined user document
        },
      },
      { $sort: { timestamp: -1 } }, // Optional: Sort by newest first
    ])
    .toArray();
}
