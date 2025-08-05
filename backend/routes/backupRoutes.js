const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backupController');
const authMiddleware = require('../middleware/authMiddleware');

// 创建备份
router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), backupController.createBackup);

// 恢复备份
router.post('/restore', authMiddleware.protect, authMiddleware.restrictTo('admin'), backupController.restoreBackup);

// 获取备份列表
router.get('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), backupController.getBackups);

// 删除备份
router.delete('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), backupController.deleteBackup);

module.exports = router;