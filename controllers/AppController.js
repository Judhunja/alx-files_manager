import redisClient from '../utils/redis';
import dbClient from '../utils/db';

export const getStatus = (req, resp) => {
  resp.json({
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  });
};

export const getStats = async (req, resp) => {
  const users = await dbClient.nbUsers();
  const files = await dbClient.nbFiles();

  resp.status(200).json({
    users,
    files,
  });
};
