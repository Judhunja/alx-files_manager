import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || '27017';
    this.url = `mongodb://${this.host}:${this.port}`;
    this.client = new MongoClient(this.url, { useUnifiedTopology: true });

    // Database Name
    this.dbName = process.env.DB_DATABASE || 'files_manager';

    (async () => {
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      this.users = this.db.collection('users');
      this.files = this.db.collection('files');
    })();
  }

  isAlive() {
    const connected = this.client.topology.isConnected();
    return connected;
  }

  async nbUsers() {
    const count = await this.users.countDocuments();
    return count;
  }

  async nbFiles() {
    const count = await this.files.countDocuments();
    return count;
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
