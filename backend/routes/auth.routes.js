import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.models.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
// #region JwtToken

const generateUserToken = (userId)=>{
  return jwt.sign(
    {userId},
    process.env.JWT_SECRET,
    {expiresIn:'7d'}
  );
};
 
//  #region RegisterUser

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);

    if(!email || !username || !password){
      return res.status(400).json({
        message:"username,password,email required!"
      })
    }

    const isUserExisting = await User.findOne({ email });
    if (isUserExisting) {
      return res.status(200).json({ message: "user already exists!!" })
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
    const token = generateUserToken(user._Id);

    res.status(201).json({
      message: "user is successfully created !",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });


  } catch (error) {
    return res.status(501).json({ message: "Server error", error: error.message });
  }
});

// #region LoginUser


router.post('/login', async (req, res) => {
  // console.log("entering in try")
  console.log(req.body);
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "user doesn't exists!,please signup" });
    }

    //if user exists ,check his/her password
    console.log(password);
    console.log(user.password);
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(isPasswordValid);


    if (!isPasswordValid) {
      return res.status(400).json({ message: "invalid user credentials!" });
    }

    const token = generateUserToken(user._id);

    res.status(200).json({
      message: "login successfull",
      token,
      user: {
        id: user._id,
        username: user.username,
        email:user.email,
      }
    });

  }catch (error) {
    console.log("error didn't get into try");
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
export default router;