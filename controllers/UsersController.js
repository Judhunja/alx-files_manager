import dbClient from '../utils/db';

const crypto = require('crypto');

export const postNew = async (req, resp) => {
  const user = req.body;
  if (!user.email) {
    return resp.status(400).json({ error: 'Missing email' });
  }
  if (!user.password) {
    return resp.status(400).json({ error: 'Missing password' });
  }
  const users = dbClient.db.collection('users');
  const existUser = await users.findOne({ email: user.email });

  if (existUser) {
    return resp.status(400).json({ error: 'Already exist' });
  }
  user.password = crypto.createHash('sha1').update(user.password).digest('hex');

  const insertReply = await users.insertOne(user);
  const insertUser = insertReply.ops[0];
  return resp.status(201).json({
    id: insertUser._id,
    email: insertUser.email,
  });
};

export const getMe = async (req, resp) => {
  const authHeader = req.headers.authorization;

  const token = authHeader.split(' ')[0];

  const users = dbClient.db.collection('users');
  const user = await users.findOne({ token });

  if (!user) {
    return resp.status(401).json({ error: 'Unauthorized' });
  }

  return resp.json({
    email: user.email,
    id: user._id,
  });
};
