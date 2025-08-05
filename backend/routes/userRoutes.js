const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const logMiddleware = require('../middleware/logMiddleware');
const { cacheMiddleware, clearCacheMiddleware } = require('../middleware/cacheMiddleware');
const { CACHE_KEYS } = require('../config/cacheConfig');

// 注册新用户
router.post('/register', logMiddleware.logRegister, userController.registerUser);

// 用户登录
router.post('/login', logMiddleware.logLogin, userController.loginUser);

// 获取用户列表
router.get('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), cacheMiddleware(CACHE_KEYS.USER_LIST), userController.getUsers);

// 获取单个用户
router.get('/:id', authMiddleware.protect, userController.getUser);

// 更新用户
router.put('/:id', authMiddleware.protect, clearCacheMiddleware(CACHE_KEYS.USER_LIST), userController.updateUser);

// 删除用户
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), clearCacheMiddleware(CACHE_KEYS.USER_LIST), userController.deleteUser);

module.exports = router;