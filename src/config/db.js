const { MongoClient, ServerApiVersion } = require('mongodb');

let dbClient = null;
let database = null;

async function connectDB() {
  if (database) return database;

  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/studiospace';
  
  try {
    const clientOptions = {
      serverApi: uri.includes('mongodb+srv') ? {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      } : undefined,
    };

    dbClient = new MongoClient(uri, clientOptions);
    await dbClient.connect();
    
    // Choose database name (default to studiospace)
    database = dbClient.db(process.env.DB_NAME || 'studiospace');
    console.log(`[MongoDB] Connected successfully to database: ${database.databaseName}`);
    return database;
  } catch (error) {
    console.error('[MongoDB] Connection error:', error.message);
    throw error;
  }
}

function getDB() {
  if (!database) {
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  return database;
}

function getStudiosCollection() {
  return getDB().collection('studios');
}

function getBookingsCollection() {
  return getDB().collection('bookings');
}

function getUsersCollection() {
  return getDB().collection('users');
}

function getWishlistCollection() {
  return getDB().collection('wishlist');
}

module.exports = {
  connectDB,
  getDB,
  getStudiosCollection,
  getBookingsCollection,
  getUsersCollection,
  getWishlistCollection,
};

