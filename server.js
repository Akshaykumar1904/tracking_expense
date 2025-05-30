import express from 'express';
import dotenv from 'dotenv';
import connectDb from './backend/config/database.config.js';

dotenv.config();

connectDb();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "Expense tacker is running! " })
});


app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});