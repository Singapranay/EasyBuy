const mongoose = require('mongoose');

const connectDB = async () => {
  let retries = 5;
  while (retries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://singapranay123:Lb1H1blBD0NLr4lF@cluster0.rfapt8x.mongodb.net/SV_DB?retryWrites=true&w=majority&appName=Cluster0', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected');
      break;
    } catch (error) {
      console.error('MongoDB connection error:', error.message);
      retries -= 1;
      console.log(`Retries left: ${retries}`);
      // Wait 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  if (!retries) {
    console.error('Could not connect to MongoDB after multiple attempts. Exiting.');
    process.exit(1);
  }
};

module.exports = connectDB;
