const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const authMiddleware = require('../../../middleware/authMiddleware');
const { cacheMiddleware, clearCacheMiddleware } = require('../../../middleware/cacheMiddleware');
const { CACHE_KEYS } = require('../../../config/cacheConfig');

// 创建新角色
router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), roleController.createRole);

// 获取角色列表
router.get('/', authMiddleware.protect, cacheMiddleware(CACHE_KEYS.ROLE_LIST), roleController.getRoles);

// 获取单个角色
router.get('/:id', authMiddleware.protect, cacheMiddleware(CACHE_KEYS.ROLE_DETAIL), roleController.getRole);

// 更新角色
router.put('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), clearCacheMiddleware(CACHE_KEYS.ROLE_LIST), roleController.updateRole);

// 删除角色
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), clearCacheMiddleware(CACHE_KEYS.ROLE_LIST), roleController.deleteRole);

module.exports = router;