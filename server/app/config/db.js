
const mongoose = require('mongoose');

const DEFAULT_RETRY_ATTEMPTS = 5;
const DEFAULT_RETRY_DELAY_MS = 2000;

const connectDB = async (options = {}) => {
  const {
    retries = DEFAULT_RETRY_ATTEMPTS,
    retryDelay = DEFAULT_RETRY_DELAY_MS,
    mongoUri = process.env.MONGO_URI
  } = options;

  if (!mongoUri) {
    console.error('MONGO_URI not set');
    process.exit(1);
  }

  let attempt = 0;

  const connectWithRetry = async () => {
    attempt += 1;
    try {
      await mongoose.connect(mongoUri);
      console.log('MongoDB connected');
      attachHandlers();
    } catch (err) {
      console.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt < retries) {
        const delay = retryDelay * attempt;
        console.log(`Retrying in ${delay}ms...`);
        await new Promise((res) => setTimeout(res, delay));
        return connectWithRetry();
      } else {
        console.error('Could not connect to MongoDB. Exiting.');
        process.exit(1);
      }
    }
  };

  await connectWithRetry();
};

function attachHandlers() {
  mongoose.connection.on('connected', () => {
    console.log('Mongoose connected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose error:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected');
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT: closing mongoose');
    await mongoose.connection.close(false);
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('SIGTERM: closing mongoose');
    await mongoose.connection.close(false);
    process.exit(0);
  });
}

module.exports = connectDB;
