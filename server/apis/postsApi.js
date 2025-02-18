export async function createPost(db, userid, content) {

  const newPost = {
    userid: userid,
    content: content,
    timestamp: new Date(),
  }

  await db.collection('posts').insertOne(newPost);

  return newPost;

}
