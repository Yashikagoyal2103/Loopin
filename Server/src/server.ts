import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//middlewares
app.use(cors());
app.use(express.json());

// // MongoDB connection
// mongoose.connect(process.env.DATABASE_URL!)
//   .then(() => console.log('MongoDB connected'))
//   .catch(err => console.error('MongoDB connection error:', err));

// app.use('/api/user', require('./routes/user.js'));

// require('./config/database.js').connectDB();

app.get('/', (req, res) => {
  res.send('Server is running!!');
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});