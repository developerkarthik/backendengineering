const express = require('express');
const { loginController, registerController, verifyAuth, getUser } = require('../controllers/auth.controller');
const { hashPassword, authenticate } = require('../middleware/auth.middleware');

const authRouter = express.Router();


authRouter.post('/login', loginController);

authRouter.post('/register', hashPassword, registerController);

authRouter.get('/me', authenticate, getUser)

module.exports = authRouter;