// Fetch User by ID
export async function getUserById(db, id) {
  return await db.collection('users').findOne({ id });
}

//Create new User
export async function createUser(db, user) {
  return await db.collection('users').insertOne(user);
}

//Find or create a user based on OAuth profile
export async function findOrCreateUser(db, profile, provider) {
  const userId = `${provider}:${profile.id}`;
  let user = await getUserById(db, userId);

  if (!user) {
    user = {
      id: userId,
      username: profile.displayName,
      email: profile.emails?.[0]?.value || '',
      provider,
    };
    await createUser(db, user);
  }
  return user;
}
