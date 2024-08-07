import dbClient from '../utils/db';
import redisClient from '../utils/redis';

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
  const token = req.headers['x-token'];

  if (!token) {
    return resp.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${token}`;

  redisClient.client.get(key, async (err, userId) => {
    if (err || !userId) {
      console.error(err);
    }
    if (userId) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    const users = dbClient.db.collection('users');
    const user = await users.findOne({ _id: new dbClient.ObjectId(userId) });

    if (!user) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    return resp.json({
      email: user.email,
      id: user._id,
    });
  });
};
