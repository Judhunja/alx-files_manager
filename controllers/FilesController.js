import { ObjectId } from 'mongodb';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const { v4: uuidv4 } = require('uuid');

exports.postUpload = async (req, resp) => {
  const token = req.headers['x-token'];

  if (!token) {
    return resp.status(401).json({ error: 'Unauthorized' });
  }

  const key = `auth_${token}`;

  const foundUser = redisClient.client.get(key, async (err, userId) => {
    if (err) {
      console.error(err);
    }
    if (!userId) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    const users = dbClient.db.collection('users');
    const user = await users.findOne({ _id: new ObjectId(userId) });

    if (!user) {
      return resp.status(401).json({ error: 'Unauthorized' });
    }

    return resp.json({
      email: user.email,
      id: user._id,
    });
  });
  const fileName = req.headers.name;
  const { type } = req.headers;
  const parentId = req.header.parentId || 0;
  const isPublic = req.header.isPublic || false;
  const { data } = req.header;

  if (!fileName) {
    return resp.status(400).json({ error: 'Missing name' });
  }
  if (!type) {
    return resp.status(400).json({ error: 'Missing type' });
  }
  if (type !== 'folder' && type !== 'file' && type !== 'image') {
    return resp.status(400).json({ error: 'Missing type' });
  }
  if (!data && type !== 'folder') {
    return resp.status(400).json({ error: 'Missing data' });
  }
  const files = dbClient.db.collection('files');
  const fileParent = await files.findOne({ _id: new ObjectId(parentId) });

  if (!fileParent) {
    return resp.status(400).json({ error: 'Parent not found' });
  }
  if (fileParent.type !== 'folder') {
    return resp.status(400).json({ error: 'Parent is not a folder' });
  }
  const filePath = process.env.FOLDER_PATH || '/tmp/files_manager';

  const uuid = uuidv4();

  const storagePath = `${filePath}/${uuid}`;

  if (type === 'folder') {
    await files.insertOne({
      userId: user._id, fileName, type, isPublic, parentId, localPath: storagePath,
    });
    return resp.status(201).json({ fileParent });
  }

  const newFile = {
    userId: foundUser.id, fileName, type, isPublic, parentId, localPath: storagePath,
  };

  await files.insertOne(newFile);

  return resp.status(201).json(newFile);
};
