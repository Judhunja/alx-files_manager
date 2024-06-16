import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();

    this.client.on('error', (err) => {
      console.error(err);
    });

    this.client.connect().catch((err) => {
      console.error(err);
    });
  }

  isAlive() {
    return this.client.isOpen;
  }

  async get(key) {
    const val = await this.client.get(key);
    return val;
  }

  async set(key, value, duration) {
    await this.client.set(key, value, {
      EX: duration,
    });
  }

  async del(key) {
    await this.client.del(key);
  }
}

export default RedisClient;
