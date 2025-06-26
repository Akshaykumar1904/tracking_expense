import express from 'express';
import { changePassword, login, register, updateProfile, userProfile } from '../controllers/user.controller.js';
import { catchAsync } from '../middleware/error.middleware.js';
import auth from '../middleware/auth.middleware.js';

const router = express.Router();


router.post('/register',catchAsync(register));
router.post('/login', catchAsync(login));
router.get('/profile', auth, catchAsync(userProfile));
router.put('/updateProfile', auth,catchAsync(updateProfile));
router.put('/changePassword', auth,catchAsync(changePassword) );


export default router;