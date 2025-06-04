import express from 'express';
import bcrypt from 'bcrypt';
import User from '../models/user.models.js';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.middleware.js';
const router = express.Router();
// #region JwtToken

const generateUserToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

//  #region RegisterUser

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);

    if (!email || !username || !password) {
      return res.status(400).json({
        message: "username,password,email required!"
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
        email: user.email,
      }
    });

  } catch (error) {
    console.log("error didn't get into try");
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});

// #region userProfile
router.get('/profile', auth, async (req, res) => {
  try {
    res.status(200).json({
      message: "user profile retreived successfully",
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
      },
      // console.log("");
    });
  } catch (error) {
    return res.status(500) / json({
      message: "User doesn't exists!"
    });
  }
});

// #region profileUpdation
router.put('/updateProfile', auth, async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.user._id;
    console.log(userId);

    if (!username && !email) {
      return res.status(400).json({
        message: "username,email either are required for update",
        error: error.message
      });
    }

    // check is email is already same
    if (email && email !== req.user.email) {
      console.log("error here maybe")
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          message: "email user exists!"
        });
      }
    };

    // prepare update object
    const updateData = {};
    console.log("updating user")
    if (username) { updateData.username = username; }
    if (email) { updateData.email = email; };
    // await updateData.save();
    console.log("user is updated");

    const updateUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      {
        new: true, runvalidators: true
      }
    ).select('-password');
    console.log(updateUser);

    await updateUser.save();
    if (!updateUser) {
      return res.status(400).json({
        message: "User not found!"
      });
    };

    res.status(200).json({
      message: "User profile updated successfully!!",
      user: {
        id: updateUser._id,
        username: updateUser.username,
        email: updateUser.email
      }
    });
  } catch (error) {
    return res.status(500).json({
      message: "Invalid user or you have no permission to update",
      error: error.message
    });
  }
});



// #region updatePassword
router.put('/changePassword', auth, async (req, res) => {
  try {
    const { currentPassword, updatePassword } = req.body;
    const userId = req.user._id;

    if (!userId || !currentPassword || !updatePassword) {
      return res.status(400).json({
        message: "currentPassword,new password ,user Id are required !"
      });
    }

    if (updatePassword.length < 6) {
      return res.status(400).json({
        message: "New password must be 6 characters or long!"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(400).json({
        message: "user is required!"
      });
    }

    // check if old password of user and the one provided in req is same!
    console.log(user.password);
    console.log(currentPassword);
    const verifyCurrentPassword = await bcrypt.compare(currentPassword, user.password);
    console.log(verifyCurrentPassword);
    if (!verifyCurrentPassword) {
      return res.status(400).json({
        message: "current password mismatched!!"
      });
    }

    // check for new password ,is it same?
    const isSamePassword = await bcrypt.compare(updatePassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "new password is same as old one!!"
      });
    }

    const hashNewPassword = await bcrypt.hash(updatePassword, 10);

    await User.findByIdAndUpdate(userId, { password: hashNewPassword });
    res.status(200).json({
      message: "password is now changed/updated successfullly! "
    });



  } catch (error) {
    return res.status(500).json({
      message: "You have no permission to change",
      error: error.message,
    });
  }
})

export default router;