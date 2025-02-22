//Verify Password
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

export async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password);
} // Generate a unique 18-digit number
export function generateUserId() {
  const min = 100000; // Smallest 6-digit number
  const max = 999999; // Largest 6-digit number
  const randomNum = crypto.randomInt(min, max);
  return `local:${randomNum}`;
}
