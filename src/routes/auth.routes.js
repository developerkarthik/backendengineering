const express = require('express');
const { loginController, registerController, getUser, generateNewTokens, logoutController, logoutAllController } = require('../controllers/auth.controller');
const { hashPassword, authenticate, validateRefreshToken } = require('../middleware/auth.middleware');

const authRouter = express.Router();


authRouter.post('/login', loginController);

authRouter.post('/register', hashPassword, registerController);

authRouter.get('/me', authenticate, getUser);

authRouter.post('/refresh', validateRefreshToken, generateNewTokens);

authRouter.post('/logout', authenticate, validateRefreshToken, logoutController);

authRouter.post('/logout-all', authenticate, validateRefreshToken, logoutAllController);

module.exports = authRouter;