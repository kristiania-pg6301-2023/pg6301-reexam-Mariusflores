//Verify Password
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';

export async function verifyPassword(user, password) {
  return await bcrypt.compare(password, user.password);
}
// Generate a unique 8-digit number
export function generateUserId() {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number
  const randomNum = crypto.randomInt(min, max);
  console.log('random num:', randomNum);
  return `local:${randomNum}`;
}
export function generateOAuthDefaultNameValue() {
  const min = 10000000; // Smallest 8-digit number
  const max = 99999999; // Largest 8-digit number
  const randomNum = crypto.randomInt(min, max);
  console.log('random num:', randomNum);
  return `user:${randomNum}`;
}
