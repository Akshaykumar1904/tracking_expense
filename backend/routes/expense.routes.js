import express from 'express';
import Expense from '../models/expense.models.js'
import User from '../models/user.models.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(auth);

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


// #region createExpense
router.post('/create', async (req, res) => {
  console.log(req.body)
  try {
    console.log('here')
    const {amount, description, date } = req.body;
    const userId = req.user._id;

    if(!userId){
      return res.status(400).json({
        success:false,
        message:"UserId is required",
      })
    }
    console.log(req.user._id);
    
    // INPUT VALIDATION
    if (!description || !amount ) {
      return res.status(400).json({ 
        success: false,
        message: "amount, and category are required" 
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
    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(404).json({ 
    //     success: false,
    //     message: "User not found" 
    //   });
    // }

    // CREATE EXPENSE
    const expense = new Expense({
      userId,
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
    console.log("direct here");
    console.error('Error creating expense:', error);
    return res.status(500).json({ 
      success: false,
      message: "Internal server error", 
      error: error.message 
    });
  }
});

// #region allExpenses

router.post('/allExpenses', async (req, res) => {
  try {
    console.log(req.user._id);
    const userId  = req.user._id;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "invalid userId"
      });
    }

    // const user = await User.findOne({ _id:userId });
    // if (!user) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "Invalid user"
    //   })
    // }
    // console.log("done")
    // console.log(user);
    // console.log(user._id);



    const userExpenses = await Expense.find({userId })
      .sort({ date: -1 })
      .select('-__v');

      console.log(userExpenses);

    res.status(200).json({
      success: true,
      count: userExpenses.length,
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email
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

// #region updateExpense

router.put('/:id', async (req, res) => {
  try {
    console.log(req.body);
    const {amount, description, date } = req.body;
    const expenseId = req.params.id;
    const userId = req.user._id;
    console.log(amount,description,date);

    if (!expenseId || !userId) {
      return res.status(401).json({
        success: false,
        message: "expense & user are required"
      });
    }

    /*
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user is required"
      });
    }
      */
     console.log(userId);
     console.log(expenseId);

    const currentExpense = await Expense.findOne({
      _id: expenseId, 
      userId: userId 
    });
    console.log(currentExpense);

    if (!currentExpense) {
      return res.status(400).json({
        success: false,
        message: "Expense not available or you dont have permission to update"
      });
    }
    console.log(expenseId);
    console.log(userId);

/*
    const updateExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        amount: amount || currentExpense.amount,
        description: description || currentExpense.description,
        date: date || currentExpense.date,
        updatedAt:new Date()
      },
      { new: true, runValidators: true }
    );
    */
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      {
        amount:  amount || currentExpense.amount ,
        // category: category || currentExpense.category,
        description: description || currentExpense.description,
        date: date || currentExpense.date,
        // updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    console.log(updatedExpense);
    // await updateExpense.save();
    return res.status(201).json({
      success: true,
      message: "expense updated",
      data: updatedExpense
    })
    // console.log(data);

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server error"
    });
  }
});

// #region deleteExpense


router.delete('/:id', async (req, res) => {
  try {
    // console.log(req.params.id);
    const userId  = req.user._id;
    const expenseId  = req.params.id;
    if (!userId || !expenseId) {
      return res.status(401).json({
        success: false,
        message: "user and expense required!"
      });
    }

    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "user must exist for this operation!!"
    //   });
    // }
    console.log(expenseId);
    console.log(userId);
    const expenseToDelete = await Expense.findOneAndDelete({
      _id: expenseId,
      userId: userId,
    });
    console.log(expenseToDelete);

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