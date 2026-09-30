const express = require('express');
const { loginController, registerController, getUser, generateNewTokens } = require('../controllers/auth.controller');
const { hashPassword, authenticate, validateRefreshToken } = require('../middleware/auth.middleware');

const authRouter = express.Router();


authRouter.post('/login', loginController);

authRouter.post('/register', hashPassword, registerController);

authRouter.get('/me', authenticate, getUser);

authRouter.post('/refresh', validateRefreshToken, generateNewTokens);

module.exports = authRouter;