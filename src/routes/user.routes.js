const express = require('express');
const { getAllUser } = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

const userRouter = express.Router();


userRouter.get('/', authenticate, authorize('USER_LIST'), getAllUser);

module.exports = userRouter;
