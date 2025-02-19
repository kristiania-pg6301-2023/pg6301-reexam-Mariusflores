import express from 'express';
import { getUserFromSession } from '../utils/sessionUtils.js';
import { getUserByUsername, updateUsername } from '../apis/userApi.js';
import { db } from '../config/db.js';

const router = express.Router();

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

    const checkUser = await getUserByUsername(db, newUsername);
    if (checkUser) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    await updateUsername(db, userid, newUsername);
    return res.status(200).json({ message: 'Username edited successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

export default router;
