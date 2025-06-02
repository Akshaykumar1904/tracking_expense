import express from 'express';
import Expense from '../models/expense.models.js'
import User from '../models/user.models.js';
// import auth from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/create', async (req, res) => {
  try {
    const { email, amount, description, date } = req.body;
    
    // INPUT VALIDATION
    if (!email || !amount ) {
      return res.status(400).json({ 
        success: false,
        message: "Email, amount, and category are required" 
      });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ 
        success: false,
        message: "Amount must be a positive number" 
      });
    }

    // FIND USER
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }

    // CREATE EXPENSE
    const expense = new Expense({
      userId: user._id,
      amount: parseFloat(amount), // Ensure it's a number
      description: description || "", // Default to empty string if not provided
      date: date ? new Date(date) : new Date() // Ensure proper date format
    });

    await expense.save();

    return res.status(201).json({
      success: true,
      message: "New expense created successfully!",
      data: expense // Changed from 'expense' to 'data' for consistency
    });

  } catch (error) {
    console.error('Error creating expense:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error.message 
    });
  }
});


router.post('/allExpenses', async (req, res) => {
  try {
    console.log("entering here ")
    console.log(req.query);
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "invalid email"
      });
    }
    console.log("done")

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user"
      })
    }
    // console.log("done")
    console.log(user);
    console.log(user._id);



    const userExpenses = await Expense.find({ userId: user._id })
      .sort({ date: -1 })
      .select('-__v');

      console.log(userExpenses);

    res.status(200).json({
      success: true,
      count: userExpenses.length,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      },
      data: userExpenses
    })
  } catch (error) {
    console.log("coming here")
    res.status(500).json({
      success: false,
      message: "Internal server error-not here"
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    console.log(req.body);
    const { email, amount, description, date } = req.body;
    const expenseId = req.params.id;

    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user is required"
      });
    }

    const currentExpense = await Expense.find({
      _id: expenseId,
      userId: user._id
    });

    if (!currentExpense) {
      return res.status(400).json({
        success: false,
        message: "Expense not available or you dont have permission to update"
      });
    }

    const updateExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        amount: amount || currentExpense.amount,
        description: description || currentExpense.description,
        date: date || currentExpense.date
      },
      { new: true, runValidators: true }
    );
    return res.status(201).json({
      success: true,
      message: "expense updated",
      data: updateExpense
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const { email } = req.query;
    const { expenseId } = req.params.id;
    if (!email) {
      return res.status(401).json({
        success: false,
        message: "Email required!"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user must exist for this operation!!"
      });
    }

    const expenseToDelete = await Expense.findOneAndDelete({
      _id: expenseId,
      userId: user._id,
    });

    if (!expenseToDelete) {
      return res.status(401).json({
        success: false,
        message: "Expense not found or you do not have permission to delete!"
      });
    }
    res.status(200).json({
      success: true,
      message: "expense deleted successfully",
      data: expenseToDelete
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error!",
    });
  }
})

export default router;