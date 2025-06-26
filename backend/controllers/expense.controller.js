import Expense from "../models/expense.models.js";
import { AuthorizationError, NotFoundError, ValidationError } from "../utils/customError.js";


const createExpense = async (req, res) => {
  // console.log(req.body)
  //   console.log('here')
    const { amount, description, date } = req.body;
    const userId = req.user._id;

    if (!userId) {
      throw new AuthorizationError('UserId is required');
    }
    // console.log(req.user._id);

    // INPUT VALIDATION
    if (!description || !amount) {
      throw new ValidationError("amount, and description are required");
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      throw new ValidationError("Amount must be a positive number");
    }

    /*
    FIND USER
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    */

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
}


// #region allExpenses 
const allExpenses = async (req, res) => {
    console.log(req.user._id);
    const userId = req.user._id;
    if (!userId) {
      throw new AuthorizationError('invalid userId!');
    }
    /*
    const user = await User.findOne({ _id:userId });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid user"
      })
    }
    console.log("done")
    console.log(user);
    console.log(user._id);
    */

    const userExpenses = await Expense.find({ userId })
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
}

//#region updateExpense
const updateExpense = async (req, res) => {
    // console.log(req.body);
    const { amount, description, date } = req.body;
    const expenseId = req.params.id;
    const userId = req.user._id;
    // console.log(amount, description, date);

    if (!expenseId || !userId) {
      throw new AuthorizationError("expenseID & userID are required")
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
    // console.log(userId);
    // console.log(expenseId);

    const currentExpense = await Expense.findOne({
      _id: expenseId,
      userId: userId
    });
    // console.log(currentExpense);

    if (!currentExpense) {
      throw new NotFoundError("Expense not available or you dont have permission to update");
    }
    // console.log(expenseId);
    // console.log(userId);

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
        amount: amount || currentExpense.amount,
        // category: category || currentExpense.category,
        description: description || currentExpense.description,
        date: date || currentExpense.date,
        // updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    // console.log(updatedExpense);
    // await updateExpense.save();
    return res.status(201).json({
      success: true,
      message: "expense updated",
      data: updatedExpense
    })
    // console.log(data);
}

//#region deleteExpense

const deleteExpense = async (req, res) => {
    // console.log(req.params.id);
    const userId = req.user._id;
    const expenseId = req.params.id;
    if (!userId || !expenseId) {
      throw new AuthorizationError('userID and expenseID required!')
    }

    /*
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user must exist for this operation!!"
      });
    }
      */
    // console.log(expenseId);
    // console.log(userId);
    const expenseToDelete = await Expense.findOneAndDelete({
      _id: expenseId,
      userId: userId,
    });
    console.log(expenseToDelete);

    if (!expenseToDelete) {
      throw new NotFoundError('Expense not found or you do not have permission to delete!')
    }
    res.status(200).json({
      success: true,
      message: "expense deleted successfully",
      data: expenseToDelete
    });
}

export {
  createExpense,
  allExpenses,
  updateExpense,
  deleteExpense
}