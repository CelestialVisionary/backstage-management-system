const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const authMiddleware = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');
const { CACHE_KEYS } = require('../config/cacheConfig');

// 获取用户统计数据
router.get('/users', authMiddleware.protect, authMiddleware.hasPermission('read:stats'), cacheMiddleware(CACHE_KEYS.USER_STATS), statsController.getUserStats);

// 获取系统概览统计
router.get('/overview', authMiddleware.protect, authMiddleware.hasPermission('read:stats'), cacheMiddleware(CACHE_KEYS.STATS_OVERVIEW), statsController.getSystemOverview);

// 获取活跃用户统计
router.get('/active-users', authMiddleware.protect, authMiddleware.hasPermission('read:stats'), cacheMiddleware(CACHE_KEYS.USER_STATS), statsController.getActiveUsers);

// 获取用户操作统计
router.get('/user-actions', authMiddleware.protect, authMiddleware.hasPermission('read:stats'), cacheMiddleware(CACHE_KEYS.USER_ACTIONS), statsController.getUserActions);

// 获取错误统计
router.get('/errors', authMiddleware.protect, authMiddleware.hasPermission('read:stats'), cacheMiddleware(CACHE_KEYS.ERROR_STATS), statsController.getErrorStats);

// 获取用户增长预测
router.get('/growth-prediction', authMiddleware.protect, authMiddleware.hasPermission('read:stats'), cacheMiddleware(CACHE_KEYS.GROWTH_PREDICTION), statsController.getUserGrowthPrediction);

module.exports = router;