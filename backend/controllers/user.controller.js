import bcrypt from 'bcrypt';
import User from '../models/user.models.js';
import jwt from 'jsonwebtoken';
import { AuthenticationError, AuthorizationError, NotFoundError, ValidationError } from '../utils/customError.js';


const generateUserToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// region register

const register = async (req, res) => {

    const { username, email, password } = req.body;
    // console.log(req.body);

    if (!email || !username || !password) {
      throw new ValidationError('username,password,email required!')
    }

    const isUserExisting = await User.findOne({ email });
    if (isUserExisting) {
      throw new AuthorizationError('user already exists!!');
    }

    //hashing password before creating the user in our database 
    const hashPassword = await bcrypt.hash(password, 10);

    //creates a user 
    const user = new User({
      username,
      email,
      password: hashPassword
    });

    await user.save();

    // generate new token
    const token = generateUserToken(user._id);

    res.status(201).json({
      message: "user is successfully created !",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
}

// #region login

const login = async (req, res) => {
  // console.log("entering in try")
  // console.log(req.body);
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new AuthenticationError("user doesn't exists!,please signup");
    }

    //if user exists ,check his/her password
    // console.log(password);
    // console.log(user.password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    // console.log(isPasswordValid);


    if (!isPasswordValid) {
      throw new ValidationError('invalid user credentials!')
    }

    const token = generateUserToken(user._id);

    res.status(200).json({
      message: "login successfull",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
}

// #region userProfile

const userProfile = async (req, res) => {
    res.status(200).json({
      message: "user profile retreived successfully",
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
      // console.log("");
    });
}

// #region updateProfule

const updateProfile = async (req, res) => {
    const { username, email } = req.body;
    const userId = req.user._id;
    // console.log(userId);

    if (!username && !email) {
      throw new AuthorizationError('username,email either are required for update');
    }

    // check is email is already same
    if (email && email !== req.user.email) {
      // console.log("error here maybe")
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new ValidationError('email already exists!')
      }
    };

    // prepare update object
    const updateData = {};
    // console.log("updating user")
    if (username) { updateData.username = username; }
    if (email) { updateData.email = email; };
    // await updateData.save();
    // console.log("user is updated");

    const updateUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true, runvalidators: true
      }
    ).select('-password');
    // console.log(updateUser);

    await updateUser.save();
    if (!updateUser) {
      throw new NotFoundError('User not found!');
    };

    res.status(200).json({
      message: "User profile updated successfully!!",
      user: {
        id: updateUser._id,
        username: updateUser.username,
        email: updateUser.email
      }
    });
}

// #region changePassword

const changePassword = async(req,res)=>{
    const { currentPassword, updatePassword } = req.body;
    const userId = req.user._id;

    if (!userId || !currentPassword || !updatePassword) {
      throw new ValidationError('currentPassword,new password ,user Id are required !')
    }

    if (updatePassword.length < 6) {
      throw new ValidationError('New password must be 6 characters or long!')
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new AuthorizationError('user is required!');
    }

    // check if old password of user and the one provided in req is same!
    // console.log(user.password);
    // console.log(currentPassword);
    const verifyCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    // console.log(verifyCurrentPassword);
    if (!verifyCurrentPassword) {
      throw new ValidationError('current password mismatched!');
    }

    // check for new password ,is it same?
    const isSamePassword = await bcrypt.compare(updatePassword, user.password);
    if (isSamePassword) {
      throw new ValidationError("new password is same as old one!!");
    }

    const hashNewPassword = await bcrypt.hash(updatePassword, 10);

    await User.findByIdAndUpdate(userId, { password: hashNewPassword });
    res.status(200).json({
      message: "password is now changed/updated successfullly! "
    });

}

export {
  register,
  login,
  userProfile,
  updateProfile,
  changePassword
}