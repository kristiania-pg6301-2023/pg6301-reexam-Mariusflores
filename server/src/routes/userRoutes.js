import express from 'express';
import { getUserFromSession } from '../utils/sessionUtils.js';
import { getUserById, getUserByUsername, setVerified, updateUsername } from '../apis/userApi.js';
import { db } from '../config/db.js';

const router = express.Router();

/**
 * Helper Functions
 * */
async function checkVerified(userid) {
  const user = await getUserById(db, userid);

  return user && user.verified;
}

/**
 * Post Routes
 * */

router.post('/change-username', async (req, res) => {
  try {
    const userid = getUserFromSession(req);
    const { newUsername } = req.body;

    if (!userid) {
      return res.status(401).json({ message: 'Unauthorized. Please log in' });
    }

    if (!newUsername) {
      res.status(400).json({ message: 'Username cannot be empty.' });
      return;
    }

    const checkUser = await getUserByUsername(db, newUsername);
    if (checkUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    await updateUsername(db, userid, newUsername);
    return res.status(200).json({ message: 'Username edited successfully' });
  } catch (error) {
    console.log('An error occurred:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * Get Verified
 * */
router.post('/verify', async (req, res) => {
  try {
    const userid = getUserFromSession(req);

    if (!userid) {
      return res.status(401).json({ message: 'Unauthorized. Please log in' });
    }

    console.log('User ID:', userid);

    const isVerified = await checkVerified(userid);
    console.log(isVerified);
    if (isVerified) {
      return res.status(409).json({ message: 'You are already verified' });
    }

    console.log('Is Verified', isVerified);

    const response = await setVerified(db, userid);
    console.log('Response verify:', response);

    return res.status(200).json({ message: 'You are now verified' });
  } catch (error) {
    console.log('Error verifying', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
