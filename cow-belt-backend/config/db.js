const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection options
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      retryWrites: true,
      retryReads: true
    };

    await mongoose.connect(process.env.MONGO_URI, options);
    
    console.log("✅ MongoDB connected successfully");
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
    
    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('🔄 MongoDB reconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        console.log('🛑 MongoDB connection closed through app termination');
        process.exit(0);
      } catch (err) {
        console.error('❌ Error closing MongoDB connection:', err);
        process.exit(1);
      }
    });
    
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("🔧 Please check your MONGO_URI environment variable");
    process.exit(1);
  }
};

// Database health check function
const checkDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: state === 1 ? 'healthy' : 'unhealthy',
      state: states[state],
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.db?.databaseName || 'unknown'
    };
  } catch (err) {
    return {
      status: 'error',
      error: err.message
    };
  }
};

// Database statistics function
const getDBStats = async () => {
  try {
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize
    };
  } catch (err) {
    return {
      error: err.message
    };
  }
};

module.exports = { connectDB, checkDBHealth, getDBStats };