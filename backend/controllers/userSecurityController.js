const User = require('../modules/users/models/userModel');
const twoFactorService = require('../services/twoFactorService');

/**
 * 用户安全控制器
 * 处理双因素认证和IP白名单相关操作
 */
const userSecurityController = {
  /**
   * 生成双因素认证密钥
   */
  async generateTwoFactorSecret(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      }

      const result = await twoFactorService.generateSecret(user);
      res.status(200).json({
        message: '双因素认证密钥生成成功',
        data: result
      });
    } catch (error) {
      console.error('生成双因素认证密钥失败:', error.message);
      res.status(500).json({
        message: '生成双因素认证密钥失败',
        error: error.message
      });
    }
  },

  /**
   * 启用双因素认证
   */
  async enableTwoFactor(req, res) {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({
          message: '请提供验证码'
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      }

      const updatedUser = await twoFactorService.enableTwoFactor(user, token);
      res.status(200).json({
        message: '双因素认证已启用',
        data: {
          twoFactorEnabled: updatedUser.twoFactorEnabled,
          recoveryCodes: updatedUser.twoFactorRecoveryCodes
        }
      });
    } catch (error) {
      console.error('启用双因素认证失败:', error.message);
      res.status(500).json({
        message: '启用双因素认证失败',
        error: error.message
      });
    }
  },

  /**
   * 禁用双因素认证
   */
  async disableTwoFactor(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      }

      const updatedUser = await twoFactorService.disableTwoFactor(user);
      res.status(200).json({
        message: '双因素认证已禁用',
        data: {
          twoFactorEnabled: updatedUser.twoFactorEnabled
        }
      });
    } catch (error) {
      console.error('禁用双因素认证失败:', error.message);
      res.status(500).json({
        message: '禁用双因素认证失败',
        error: error.message
      });
    }
  },

  /**
   * 验证恢复代码
   */
  async verifyRecoveryCode(req, res) {
    try {
      const { code } = req.body;
      if (!code) {
        return res.status(400).json({
          message: '请提供恢复代码'
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      }

      const isVerified = await twoFactorService.verifyRecoveryCode(user, code);
      if (isVerified) {
        res.status(200).json({
          message: '恢复代码验证成功',
          data: {
            remainingRecoveryCodes: user.twoFactorRecoveryCodes.length
          }
        });
      } else {
        res.status(400).json({
          message: '无效的恢复代码'
        });
      }
    } catch (error) {
      console.error('验证恢复代码失败:', error.message);
      res.status(500).json({
        message: '验证恢复代码失败',
        error: error.message
      });
    }
  },

  /**
   * 添加IP到白名单
   */
  async addIpToWhitelist(req, res) {
    try {
      const { ip } = req.body;
      if (!ip) {
        return res.status(400).json({
          message: '请提供IP地址'
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      }

      await user.addIpToWhitelist(ip);
      res.status(200).json({
        message: 'IP已添加到白名单',
        data: {
          whitelistedIPs: user.whitelistedIPs
        }
      });
    } catch (error) {
      console.error('添加IP到白名单失败:', error.message);
      res.status(500).json({
        message: '添加IP到白名单失败',
        error: error.message
      });
    }
  },

  /**
   * 从白名单中移除IP
   */
  async removeIpFromWhitelist(req, res) {
    try {
      const { ip } = req.body;
      if (!ip) {
        return res.status(400).json({
          message: '请提供IP地址'
        });
      }

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      }

      await user.removeIpFromWhitelist(ip);
      res.status(200).json({
        message: 'IP已从白名单中移除',
        data: {
          whitelistedIPs: user.whitelistedIPs
        }
      });
    } catch (error) {
      console.error('从白名单中移除IP失败:', error.message);
      res.status(500).json({
        message: '从白名单中移除IP失败',
        error: error.message
      });
    }
  },

  /**
   * 清空IP白名单
   */
  async clearIpWhitelist(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      }

      await user.clearIpWhitelist();
      res.status(200).json({
        message: 'IP白名单已清空',
        data: {
          whitelistedIPs: user.whitelistedIPs
        }
      });
    } catch (error) {
      console.error('清空IP白名单失败:', error.message);
      res.status(500).json({
        message: '清空IP白名单失败',
        error: error.message
      });
    }
  },

  /**
   * 获取IP白名单
   */
  async getIpWhitelist(req, res) {
    try {
      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({
          message: '用户不存在'
        });
      }

      res.status(200).json({
        message: '获取IP白名单成功',
        data: {
          whitelistedIPs: user.whitelistedIPs || []
        }
      });
    } catch (error) {
      console.error('获取IP白名单失败:', error.message);
      res.status(500).json({
        message: '获取IP白名单失败',
        error: error.message
      });
    }
  }
};

module.exports = userSecurityController;