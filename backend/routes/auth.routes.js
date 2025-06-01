import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.models.js';


const router = express.Router();

/*
Register user
*/

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);
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

    res.status(201).json({
      message: "user is successfully created !",
      userId: user._id,
    });


  } catch (error) {
    return res.status(501).json({ message: "Server error", error: error.message });
  }
});


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

    res.status(200).json({
      message: "login successfull",
      userId: user._id,
      username: user.username
    });

  }catch (error) {
    console.log("error didn't get into try");
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});
export default router;