import { MongoClient } from 'mongodb';

const { env } = require('node:process');

class DBClient {
  constructor() {
    const host = env.DB_HOST || 'localhost';
    const port = env.DB_PORT || '27017';
    const database = env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}`;
    this.client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });

    this.client.connect();

    this.database = database;
  }

  isAlive() {
    return this.client.topology.isConnected();
  }

  async nbUsers() {
    const db = this.client.db(this.database);
    const numberDocs = await db.collection('users').countDocuments();
    return numberDocs;
  }

  async nbFiles() {
    const db = this.client.db(this.database);
    const numberDocs = await db.collection('files').countDocuments();
    return numberDocs;
  }
}

const dbClient = new DBClient();
export default dbClient;
