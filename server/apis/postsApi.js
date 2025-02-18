export async function createPost(db, userid, content) {

  const newPost = {
    userid: userid,
    content: content,
    timestamp: new Date(),
  }

  await db.collection('posts').insertOne(newPost);

  return newPost;

}

/**
 * $lookup to join users collection with posts and retrieve desired fields
 * */
export async function getAllPosts(db) {
  return await db.collection("posts").aggregate([
    {
      $lookup: {
        from: "users",        // Collection to join
        localField: "userid", // Field in "posts" collection
        foreignField: "id",  // Field in "users" collection (assuming _id is the user identifier)
        as: "userDetails"     // Output field name
      }
    },
    {
      $unwind: "$userDetails" // Flatten user array (optional)
    },
    {
      $project: { // Select only the fields you need
        content: 1,
        timestamp: 1,
        username: "$userDetails.username", // Get username from joined user document
        _id: 1 // Include post ID if needed
      }
    }
  ]).toArray();
}

/**
 * Get all posts from user
 * */
export async function getAllPostsFromUser(db, userid){

  return await db.collection('posts').aggregate([
    {
      $match: {userid: userid} // Filter by userid
    },
    {
      $lookup: {
        from: "users",
        localField: "userid",
        foreignField: "id",
        as: "userDetails"
      }
    },
    {
      $unwind: "$userDetails"
    },
    {
      $project: {
        content: 1,
        timestamp: 1,
        username: "$userDetails.username",
        _id: 1
      }
    }
  ]).toArray();
}
