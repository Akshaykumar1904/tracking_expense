/*
import User from '../models/user.models.js';
now we've used auth-middleware to get userId
*/
import express from 'express';
import auth from '../middleware/auth.middleware.js';
import { allExpenses, createExpense, deleteExpense, updateExpense } from '../controllers/expense.controller.js';
import { catchAsync } from '../middleware/error.middleware.js';

const router = express.Router();
router.use(auth);

/*
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Expense routes are working!',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email
    }
  });
});
*/

router.post('/create', catchAsync(createExpense));
router.post('/allExpenses', catchAsync(allExpenses));
router.put('/:id', catchAsync(updateExpense));
router.delete('/:id', catchAsync(deleteExpense));

export default router;