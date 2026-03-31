import express from 'express';
import {
    signupUser,
    signinUser,
    loginUser,
    registerUser,
} from '../controllers/user.js';

const router = express.Router();
router.post('/signup', signupUser);
router.post('/signin', signinUser);

router.post('/login', loginUser);
router.post('/register', registerUser);

export default router;
