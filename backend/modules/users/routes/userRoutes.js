const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../../../middleware/authMiddleware');
const logMiddleware = require('../../../middleware/logMiddleware');
const activityLogController = require('../../../controllers/activityLogController');
const { cacheMiddleware, clearCacheMiddleware } = require('../../../middleware/cacheMiddleware');
const { CACHE_KEYS } = require('../../../config/cacheConfig');

// 注册新用户
router.post('/register', logMiddleware.logRegister, activityLogController.logActivity('register', 'user'), userController.registerUser);

// 用户登录
router.post('/login', logMiddleware.logLogin, activityLogController.logActivity('login', 'user'), userController.loginUser);

// 请求密码重置
router.post('/forgotPassword', userController.forgotPassword);

// 重置密码
router.patch('/resetPassword/:token', userController.resetPassword);

// 获取用户列表
router.get('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), cacheMiddleware(CACHE_KEYS.USER_LIST), userController.getUsers);

// 搜索和筛选用户
router.get('/search', authMiddleware.protect, authMiddleware.restrictTo('admin'), cacheMiddleware(CACHE_KEYS.USER_LIST), userController.searchUsers);

// 获取单个用户
router.get('/:id', authMiddleware.protect, cacheMiddleware(CACHE_KEYS.USER_DETAIL), userController.getUser);

// 更新个人资料
router.patch('/profile', authMiddleware.protect, userController.updateProfile);

// 更新用户
router.put('/:id', authMiddleware.protect, clearCacheMiddleware(CACHE_KEYS.USER_LIST), userController.updateUser);

// 删除用户
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), clearCacheMiddleware(CACHE_KEYS.USER_LIST), userController.deleteUser);

// 批量导入用户
router.post('/batch-import', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.batchImportUsers);

// 批量导出用户
router.get('/batch-export', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.batchExportUsers);

// 批量分配角色
router.patch('/batch-assign-roles', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.batchAssignUserRoles);

// 批量删除用户
router.delete('/batch-delete', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.batchDeleteUsers);

module.exports = router;