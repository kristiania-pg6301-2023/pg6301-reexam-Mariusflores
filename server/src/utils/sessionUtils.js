/**
 * Extracts logged in user from session
 * */
export function getUserFromSession(req) {
  return req.user ? req.user.id : null;
}
