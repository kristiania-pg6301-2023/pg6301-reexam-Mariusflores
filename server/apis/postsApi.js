import { ObjectId } from 'mongodb';

/**
 * Get Post by id
 * */
export async function getPostById(db, postId) {
  return await db.collection('posts').findOne({ _id: new ObjectId(postId) });
}

/**
 * $lookup to join users collection with posts and retrieve desired fields
 * */
export async function getAllPosts(db) {
  return await db
    .collection('posts')
    .aggregate([
      {
        $lookup: {
          from: 'users', // Collection to join
          localField: 'userid', // Field in "posts" collection
          foreignField: 'id', // Field in "users" collection (assuming _id is the user identifier)
          as: 'userDetails', // Output field name
        },
      },
      {
        $unwind: '$userDetails', // Flatten user array (optional)
      },
      {
        $project: {
          // Select only the fields you need
          content: 1,
          timestamp: 1,
          reactions: 1,
          username: '$userDetails.username', // Get username from joined user document
          _id: 1, // Include post ID if needed
        },
      },
    ])
    .toArray();
}

/**
 * Get all posts from user
 * */
export async function getAllPostsFromUser(db, userid) {
  return await db
    .collection('posts')
    .aggregate([
      {
        $match: { userid: userid }, // Filter by userid
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userid',
          foreignField: 'id',
          as: 'userDetails',
        },
      },
      {
        $unwind: '$userDetails',
      },
      {
        $project: {
          content: 1,
          timestamp: 1,
          reactions: 1,
          username: '$userDetails.username',
          _id: 1,
        },
      },
    ])
    .toArray();
}

/**
 * Create a post
 **/

export async function createPost(db, userid, content) {
  const newPost = {
    userid: userid,
    content: content,
    timestamp: new Date(),
    reactions: [],
  };

  await db.collection('posts').insertOne(newPost);

  return newPost;
}

/**
 *
 * Delete Post using ID
 * */

export async function deletePostById(db, postId) {
  return await db.collection('posts').deleteOne({ _id: new ObjectId(postId) });
}

/**
 * Edit Post content field
 * */
export async function editPostById(db, postId, newContent) {
  return await db.collection('posts').updateOne(
    { _id: new ObjectId(postId) }, // Find the post by ID
    { $set: { content: newContent } } // Update only the content field
  );
}

export async function addReactionToPost(db, postId, userId, reaction) {
  return await db.collection('posts').updateOne(
    { _id: new ObjectId(postId) }, // Ensure correct ID reference
    { $push: { reactions: { userId, reaction } } } // Push object into reactions array
  );
}

/**
 * Removes Reaction from post
 * */
export async function removeReactionFromPost(db, postId, userId, reaction){
  return await db.collection('posts').updateOne(
    {_id : new ObjectId(postId)},
    {$pull: {reactions: {userId, reaction}}}
  )
}

export async function updateReactionInPost(db, postId, userId, newReaction) {
  return await db.collection('posts').updateOne(
    { _id: new ObjectId(postId) }, // Find post by ID
    {
      $set: {
        'reactions.$[elem].reaction': newReaction // Update the reaction for the user
      }
    },
    {
      arrayFilters: [{ 'elem.userId': userId }] // Ensure we update the reaction of the correct user
    }
  );
}

