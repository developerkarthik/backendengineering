const express = require('express');
const { loginController, registerController, getUser, generateNewTokens, logoutController, logoutAllController } = require('../controllers/auth.controller');
const { hashPassword, authenticate, validateRefreshToken } = require('../middleware/auth.middleware');
const { generateCsrfToken, validateCsrfToken } = require('../middleware/csrf.middleware');
const validateOrigin = require('../middleware/origin.middleware');
const { bruteForceProtection } = require('../middleware/protection.middleware');

const authRouter = express.Router();


// 

authRouter.post('/login', generateCsrfToken, loginController);

authRouter.post('/register', hashPassword, registerController);

authRouter.get('/me', authenticate, getUser);

authRouter.post('/refresh', validateOrigin, validateCsrfToken, validateRefreshToken, generateNewTokens);

authRouter.post('/logout', validateOrigin, validateCsrfToken, authenticate, validateRefreshToken, logoutController);

authRouter.post('/logout-all', validateOrigin, validateCsrfToken, authenticate, validateRefreshToken, logoutAllController);

module.exports = authRouter;