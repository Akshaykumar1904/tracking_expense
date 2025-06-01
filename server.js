import express from 'express';
import dotenv from 'dotenv';
import connectDb from './backend/config/database.config.js';
import authRoutes from './backend/routes/auth.routes.js' ;
import expenseRoutes from './backend/routes/expense.routes.js';
dotenv.config();

connectDb();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());


app.get('/', (req, res) => {
  res.json({ message: "Expense tacker is running! " })
});

app.use('/api/auth',authRoutes);
app.use('/api/expense',expenseRoutes);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});