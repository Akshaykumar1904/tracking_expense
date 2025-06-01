import express from 'express';
import Expense from '../models/expense.models.js'
import User from '../models/user.models.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { userId, amount, description, date } = req.body;
    console.log(req.body);

    const user = await User.findOne({_id:userId});
    if (!user) {
      return res.status(400).json({ message: " user not found" });
    };

    const expense = await new Expense({
      user: userId,
      amount,
      description,
      date: date || new Date()
    })

    await expense.save();

    return res.status(201).json({
      message: "new expense created!",
      expense,
    });


  } catch (error) {
    return res.status(500).json({ message: "internal server error", error: error.message });
  }
})

export default router;