const express = require('express');
const router = express.Router();
const activityLogController = require('../controllers/activityLogController');
const authMiddleware = require('../middleware/authMiddleware');

// 获取当前用户的活动日志
router.get('/my-logs', authMiddleware.protect, activityLogController.getUserActivityLogs);

// 获取所有用户的活动日志（管理员）
router.get('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), activityLogController.getAllActivityLogs);

module.exports = router;