import dbClient from '../utils/db';

const crypto = require('crypto');

exports.postNew = async (req, resp) => {
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
