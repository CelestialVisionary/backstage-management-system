const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../modules/users/models/userModel');
const crypto = require('crypto');

/**
 * 双因素认证服务
 */
const twoFactorService = {
  /**
   * 生成双因素认证密钥
   * @param {Object} user - 用户对象
   * @returns {Promise<Object>} 包含密钥和二维码URL的对象
   */
  async generateSecret(user) {
    try {
      // 生成随机密钥
      const secret = speakeasy.generateSecret({
        name: `后台管理系统 (${user.email})`
      });

      // 更新用户记录
      user.twoFactorSecret = secret.base32;
      user.twoFactorEnabled = false; // 初始化为未启用
      await user.save();

      // 生成二维码URL
      const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);

      return {
        secret: secret.base32,
        qrCodeUrl,
        otpauthUrl: secret.otpauth_url
      };
    } catch (error) {
      console.error('生成双因素认证密钥失败:', error.message);
      throw error;
    }
  },

  /**
   * 验证双因素认证代码
   * @param {Object} user - 用户对象
   * @param {string} token - 验证码
   * @returns {boolean} 验证结果
   */
  verifyToken(user, token) {
    try {
      if (!user.twoFactorSecret) {
        throw new Error('用户未设置双因素认证');
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token
      });

      return verified;
    } catch (error) {
      console.error('验证双因素认证代码失败:', error.message);
      throw error;
    }
  },

  /**
   * 启用双因素认证
   * @param {Object} user - 用户对象
   * @param {string} token - 验证码
   * @returns {Promise<Object>} 更新后的用户对象
   */
  async enableTwoFactor(user, token) {
    try {
      // 验证验证码
      const isVerified = this.verifyToken(user, token);
      if (!isVerified) {
        throw new Error('验证码无效');
      }

      // 启用双因素认证
      user.twoFactorEnabled = true;

      // 生成恢复代码
      user.twoFactorRecoveryCodes = this.generateRecoveryCodes(5);

      await user.save();

      return user;
    } catch (error) {
      console.error('启用双因素认证失败:', error.message);
      throw error;
    }
  },

  /**
   * 生成恢复代码
   * @param {number} count - 生成的代码数量
   * @returns {string[]} 恢复代码数组
   */
  generateRecoveryCodes(count) {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = crypto
        .randomBytes(16)
        .toString('hex')
        .toUpperCase()
        .match(/.{1,4}/g)
        .join('-');
      codes.push(code);
    }
    return codes;
  },

  /**
   * 禁用双因素认证
   * @param {Object} user - 用户对象
   * @returns {Promise<Object>} 更新后的用户对象
   */
  async disableTwoFactor(user) {
    try {
      user.twoFactorEnabled = false;
      user.twoFactorSecret = undefined;
      user.twoFactorRecoveryCodes = undefined;
      await user.save();
      return user;
    } catch (error) {
      console.error('禁用双因素认证失败:', error.message);
      throw error;
    }
  },

  /**
   * 验证恢复代码
   * @param {Object} user - 用户对象
   * @param {string} code - 恢复代码
   * @returns {Promise<boolean>} 验证结果
   */
  async verifyRecoveryCode(user, code) {
    try {
      if (!user.twoFactorRecoveryCodes || user.twoFactorRecoveryCodes.length === 0) {
        throw new Error('没有可用的恢复代码');
      }

      // 查找并移除匹配的恢复代码
      const codeIndex = user.twoFactorRecoveryCodes.indexOf(code);
      if (codeIndex === -1) {
        return false;
      }

      user.twoFactorRecoveryCodes.splice(codeIndex, 1);
      await user.save();
      return true;
    } catch (error) {
      console.error('验证恢复代码失败:', error.message);
      throw error;
    }
  }
};

module.exports = twoFactorService;