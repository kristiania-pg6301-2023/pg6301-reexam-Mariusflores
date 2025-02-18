import '../styling/posts.css'

export function mapPosts(posts) {
  return (
    <>
      {posts.length === 0 ? <p>No posts available.</p> : null}

      {posts.map((post) => (
        <div className={'post-container'} key={post._id}> {/* Add unique key */}
          <h3 className={'post-username'}>{post.username || 'Unknown User'}</h3>
          <p className={'post-content'}>{post.content}</p>
          <p className={'post-timestamp'}>{new Date(post.timestamp).toLocaleString()}</p> {/* Format timestamp */}
        </div>
      ))}
    </>
  );
}