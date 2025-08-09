const express = require('express');
const router = express.Router();
const userSecurityController = require('../../../controllers/userSecurityController');
const authMiddleware = require('../../../middleware/authMiddleware');

// 双因素认证相关路由
router.post('/two-factor/generate', authMiddleware.protect, userSecurityController.generateTwoFactorSecret);
router.post('/two-factor/enable', authMiddleware.protect, userSecurityController.enableTwoFactor);
router.post('/two-factor/disable', authMiddleware.protect, userSecurityController.disableTwoFactor);
router.post('/two-factor/verify-recovery', authMiddleware.protect, userSecurityController.verifyRecoveryCode);

// IP白名单相关路由
router.post('/ip-whitelist/add', authMiddleware.protect, userSecurityController.addIpToWhitelist);
router.post('/ip-whitelist/remove', authMiddleware.protect, userSecurityController.removeIpFromWhitelist);
router.post('/ip-whitelist/clear', authMiddleware.protect, userSecurityController.clearIpWhitelist);
router.get('/ip-whitelist', authMiddleware.protect, userSecurityController.getIpWhitelist);

module.exports = router;