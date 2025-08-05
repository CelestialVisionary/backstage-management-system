const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const authMiddleware = require('../middleware/authMiddleware');

// 创建日志
router.post('/', authMiddleware.protect, logController.createLog);

// 获取日志列表
router.get('/', authMiddleware.protect, authMiddleware.hasPermission('read:logs'), logController.getLogs);

// 获取单个日志
router.get('/:id', authMiddleware.protect, authMiddleware.hasPermission('read:logs'), logController.getLog);

module.exports = router;