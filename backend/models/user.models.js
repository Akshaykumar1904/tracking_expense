import mongoose from 'mongoose';

// #region userSchema

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,

    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']

    },
    password: {
      type: String,
      required: true
    }
  },
  { timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;