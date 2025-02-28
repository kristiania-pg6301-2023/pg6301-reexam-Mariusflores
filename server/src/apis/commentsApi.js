import { ObjectId } from 'mongodb';

/**
 * Create a comment
 * */
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
/**
 * Get all comments by post id
 * */
export async function getAllCommentsByPostId(db, postId) {
  console.log('filtering comments by postId:', postId);

  let comments = await db
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
          _id: 1,
          content: 1,
          timestamp: 1,
          username: '$user.username',
        },
      },
      { $sort: { timestamp: -1 } }, // Sorted by newest first
    ])
    .toArray();
  console.log('Comments retireved:', comments);
  return comments;
}

/**
 * Get comment by id
 * */

export async function getCommentById(db, commentId) {
  return await db.collection('comments').findOne({ _id: new ObjectId(commentId) });
}

/**
 * Delete comment
 * */
export async function deleteCommentById(db, commentId) {
  return await db.collection('comments').deleteOne({ _id: new ObjectId(commentId) });
}
