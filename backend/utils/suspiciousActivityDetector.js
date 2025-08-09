const ActivityLog = require('../modules/activityLogs/models/activityLogModel');
const User = require('../modules/users/models/userModel');
const moment = require('moment');

/**
 * 异常行为检测工具
 */
const suspiciousActivityDetector = {
  // 配置参数
  config: {
    // 时间窗口内允许的最大失败登录尝试次数
    maxFailedLogins: 5,
    // 时间窗口（分钟）
    timeWindow: 15,
    // 异地登录检测阈值（公里）
   异地登录阈值: 500,
    // 不活跃时间段活动检测阈值（小时）
    inactiveHoursThreshold: 3
  },

  /**
   * 检测异常行为
   * @param {string} userId - 用户ID
   * @param {string} action - 操作类型
   * @param {string} ipAddress - IP地址
   * @returns {Promise<boolean>} 是否为异常行为
   */
  async detect(userId, action, ipAddress) {
    try {
      // 根据不同操作类型执行不同的检测逻辑
      switch (action) {
        case 'login':
          return await this.detectAnomalousLogin(userId, ipAddress);
        case 'failed_login':
          return await this.detectBruteForceAttempts(userId);
        case 'data_export':
          return await this.detectUnusualDataExport(userId);
        default:
          return false;
      }
    } catch (error) {
      console.error('异常行为检测失败:', error);
      return false;
    }
  },

  /**
   * 检测异常登录
   * @param {string} userId - 用户ID
   * @param {string} currentIp - 当前IP地址
   * @returns {Promise<boolean>} 是否为异常登录
   */
  async detectAnomalousLogin(userId, currentIp) {
    // 1. 检查用户是否有异地登录
    const recentLogins = await ActivityLog.find({
      user: userId,
      action: 'login',
      timestamp: { $gte: moment().subtract(24, 'hours').toDate() }
    }).sort({ timestamp: -1 }).limit(5);

    // 这里简化处理，实际应用中应该比较IP地址的地理位置差异
    // 例如，如果用户通常从北京登录，但突然从纽约登录，则可能是异常
    if (recentLogins.length > 0) {
      // 假设我们有一个IP地理位置服务
      // 这里只是模拟逻辑
      const is异地登录 = false; // 实际应用中应该调用IP地理位置服务
      if (is异地登录) {
        return true;
      }
    }

    // 2. 检查是否在不活跃时间段登录
    const user = await User.findById(userId);
    if (user) {
      // 假设我们有用户的活跃时间段数据
      // 这里只是模拟逻辑
      const isInactiveTime = false; // 实际应用中应该检查当前时间是否在用户不活跃时间段
      if (isInactiveTime) {
        return true;
      }
    }

    return false;
  },

  /**
   * 检测暴力破解尝试
   * @param {string} userId - 用户ID
   * @returns {Promise<boolean>} 是否为暴力破解尝试
   */
  async detectBruteForceAttempts(userId) {
    const timeWindowStart = moment().subtract(this.config.timeWindow, 'minutes').toDate();

    const failedLogins = await ActivityLog.countDocuments({
      user: userId,
      action: 'failed_login',
      timestamp: { $gte: timeWindowStart }
    });

    return failedLogins >= this.config.maxFailedLogins;
  },

  /**
   * 检测异常数据导出
   * @param {string} userId - 用户ID
   * @returns {Promise<boolean>} 是否为异常数据导出
   */
  async detectUnusualDataExport(userId) {
    const timeWindowStart = moment().subtract(1, 'hours').toDate();

    const exportActivities = await ActivityLog.countDocuments({
      user: userId,
      action: 'data_export',
      timestamp: { $gte: timeWindowStart }
    });

    // 这里简化处理，实际应用中应该根据用户历史行为设置阈值
    return exportActivities > 5; // 1小时内导出超过5次可能异常
  }
};

module.exports = suspiciousActivityDetector;