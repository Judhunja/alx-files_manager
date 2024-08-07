import crypto from 'crypto';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const { v4: uuidv4 } = require('uuid');

export const getConnect = async (req, resp) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return resp.status(401).json({ error: 'Unauthorized' });
  }

  const base64 = authHeader.split(' ')[1];

  const toString = Buffer.from(base64, 'base64').toString('ascii');
  const [email, password] = toString.split(':');

  const users = dbClient.db.collection('users');
  const sha1pwd = crypto.createHash('sha1').update(password).digest('hex');
  const user = await users.findOne({ email, password: sha1pwd });

  if (!user) {
    return resp.status(401).json({ error: 'Unauthorized' });
  }

  const tkn = uuidv4();

  const key = `auth_${tkn}`;

  redisClient.client.set(key, user._id.toString(), 'EX', 86400, (err) => {
    if (err) {
      console.error(err);
    }
  });
  return resp.status(200).json({ token: tkn });
};

export const getDisconnect = async (req, resp) => {
  const authHeader = req.headers.authorization;

  const token = authHeader.split(' ')[1];

  const users = dbClient.db.collection('users');
  const user = await users.findOne({ token });

  if (!user) {
    return resp.status(401).json({ error: 'Unauthorized' });
  }

  redisClient.client.del(`auth_${token}`);

  return resp.json(204);
};
