import mongoose from "mongoose";
import User from "./user.models.js";

const expenseSchema = mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  amount:{
    type:Number,
    required:true,
    min:0,
  },
  description:{
    type:String,
    required:true
  },
  date:{
    type:Date,
    required:true,
    default:Date.now,
  }

},{timestamps:true});


const Expense = mongoose.model("Expense",expenseSchema);
export default Expense;