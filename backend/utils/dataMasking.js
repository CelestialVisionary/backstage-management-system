const crypto = require('crypto');

/**
 * 数据脱敏工具
 */
const dataMasking = {
  /**
   * 邮箱脱敏
   * @param {string} email - 邮箱地址
   * @returns {string} 脱敏后的邮箱
   */
  maskEmail(email) {
    if (!email) return '';
    const [localPart, domain] = email.split('@');
    if (localPart.length <= 2) {
      return localPart + '*'.repeat(3) + '@' + domain;
    }
    return (
      localPart.slice(0, 2) +
      '*'.repeat(localPart.length - 2) +
      '@' +
      domain
    );
  },

  /**
   * 手机号脱敏
   * @param {string} phone - 手机号
   * @returns {string} 脱敏后的手机号
   */
  maskPhone(phone) {
    if (!phone) return '';
    // 简单判断是否为手机号格式
    if (phone.length === 11 && /^1[3-9]\d{9}$/.test(phone)) {
      return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
    }
    // 对于其他格式的电话号码，隐藏中间部分
    if (phone.length > 4) {
      return (
        phone.slice(0, 2) +
        '*'.repeat(phone.length - 4) +
        phone.slice(-2)
      );
    }
    return phone;
  },

  /**
   * 身份证号脱敏
   * @param {string} idCard - 身份证号
   * @returns {string} 脱敏后的身份证号
   */
  maskIdCard(idCard) {
    if (!idCard) return '';
    if (idCard.length === 18) {
      return idCard.replace(/(\d{6})\d{8}(\w{4})/, '$1********$2');
    }
    if (idCard.length > 6) {
      return (
        idCard.slice(0, 6) +
        '*'.repeat(idCard.length - 10) +
        idCard.slice(-4)
      );
    }
    return idCard;
  },

  /**
   * 银行卡号脱敏
   * @param {string} bankCard - 银行卡号
   * @returns {string} 脱敏后的银行卡号
   */
  maskBankCard(bankCard) {
    if (!bankCard) return '';
    if (bankCard.length > 8) {
      return (
        bankCard.slice(0, 4) +
        '*'.repeat(bankCard.length - 8) +
        bankCard.slice(-4)
      );
    }
    return bankCard;
  },

  /**
   * 自定义脱敏
   * @param {string} str - 需要脱敏的字符串
   * @param {number} start - 开始保留的长度
   * @param {number} end - 结束保留的长度
   * @returns {string} 脱敏后的字符串
   */
  maskCustom(str, start = 2, end = 2) {
    if (!str) return '';
    if (str.length <= start + end) {
      return str;
    }
    return (
      str.slice(0, start) +
      '*'.repeat(str.length - start - end) +
      str.slice(-end)
    );
  }
};

module.exports = dataMasking;