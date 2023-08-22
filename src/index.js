import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/user.js';
import taskRoutes from './routes/tweet.js';
import cors from 'cors';

dotenv.config();

// const tweetRouter = require('./routers/tweet');

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('Connected to MongoDB cluster');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

const app = express();

const port = process.env.PORT;
app.use(cors());
app.use(express.json());

app.use(userRoutes);
app.use(taskRoutes);

app.listen(port, () => {
  console.log('Server is up on port ' + port);
});
