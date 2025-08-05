import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import ConnectDB from './config/db.js';
import { inngest, functions  } from "./inngest/index.js"
import { serve } from "inngest/express.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

//middlewares
app.use(cors());
app.use(express.json());
app.use("/api/inngest", serve({ client: inngest, functions }));

// Connect to MongoDB
await ConnectDB();

// Route
app.get('/', (req, res) => {
  res.send('Server is running!!');
});

app.listen(PORT, () => {
  console.log(`Server running on Port ${PORT}`);
});