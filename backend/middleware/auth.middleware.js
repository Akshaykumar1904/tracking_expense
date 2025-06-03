import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      return res.status(400).json({
        success: false,
        message: "Access denied,token required",
      });
    }

    //token extraction
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Invalid token,valid token required"
      });
    }
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "invalid token"
      });
    }

    //check for user
    const user = await User.findById(decodedToken.userId).select('-password');
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "token valid but user no longer exists"
      });
    }

    //attach the user
    req.user = user;

    next();

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "server error"
    });
  }
};


export default auth;
