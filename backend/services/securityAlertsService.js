const nodemailer = require('nodemailer');
const User = require('../modules/users/models/userModel');
const ActivityLog = require('../modules/activityLogs/models/activityLogModel');
require('dotenv').config();

// 创建邮件传输器
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * 安全告警服务
 */
const securityAlertsService = {
  // 告警级别配置
  alertLevels: {
    info: {
      sendEmail: false,
      severity: '低'
    },
    warning: {
      sendEmail: true,
      severity: '中'
    },
    critical: {
      sendEmail: true,
      severity: '高',
      notifyAdmin: true
    }
  },

  /**
   * 发送安全告警
   * @param {Object} alertData - 告警数据
   * @param {string} alertData.type - 告警类型
   * @param {string} alertData.userId - 用户ID
   * @param {Object} alertData.details - 告警详情
   * @param {string} [alertData.level='warning'] - 告警级别
   * @returns {Promise<void>}
   */
  async sendAlert(alertData) {
    try {
      const { type, userId, details, level = 'warning' } = alertData;

      // 记录告警到活动日志
      await ActivityLog.create({
        user: userId,
        action: 'suspicious_activity',
        resource: 'security_alert',
        details: {
          alertType: type,
          ...details
        },
        ipAddress: details.ipAddress || 'system',
        userAgent: details.userAgent || 'system',
        securityLevel: level,
        status: 'warning',
        sessionId: 'system'
      });

      // 根据告警级别执行不同操作
      const levelConfig = this.alertLevels[level] || this.alertLevels.warning;

      if (levelConfig.sendEmail) {
        // 获取用户信息
        const user = userId ? await User.findById(userId).select('username email') : null;

        // 构建邮件内容
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: levelConfig.notifyAdmin ? process.env.ADMIN_EMAIL : (user ? user.email : process.env.ADMIN_EMAIL),
          subject: `【安全告警】${levelConfig.severity}级别: ${this.getAlertTypeName(type)}`,
          html: this.generateAlertEmailHtml(type, user, details, levelConfig.severity)
        };

        // 发送邮件
        await transporter.sendMail(mailOptions);
        console.log(`安全告警邮件已发送: ${type}`);
      }
    } catch (error) {
      console.error('发送安全告警失败:', error);
    }
  },

  /**
   * 获取告警类型名称
   * @param {string} type - 告警类型
   * @returns {string} 告警类型名称
   */
  getAlertTypeName(type) {
    const typeNames = {
      'suspicious_activity': '可疑活动',
      'brute_force_attempt': '暴力破解尝试',
      'anomalous_login': '异地登录',
      'unusual_data_export': '异常数据导出',
      'permission_escalation': '权限提升',
      'security_settings_change': '安全设置变更'
    };
    return typeNames[type] || type;
  },

  /**
   * 生成告警邮件HTML内容
   * @param {string} type - 告警类型
   * @param {Object} user - 用户信息
   * @param {Object} details - 告警详情
   * @param {string} severity - 告警严重程度
   * @returns {string} HTML内容
   */
  generateAlertEmailHtml(type, user, details, severity) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>安全告警</title>
      </head>
      <body>
        <h2 style="color: #${severity === '高' ? 'e74c3c' : severity === '中' ? 'f39c12' : '3498db'}">${severity}级别安全告警: ${this.getAlertTypeName(type)}</h2>
        <p>告警时间: ${new Date().toLocaleString()}</p>
        ${user ? `<p>用户: ${user.username} (${user.email})</p>` : '<p>用户: 未知</p>'}
        <h3>告警详情:</h3>
        <ul>
          ${details.action ? `<li>操作: ${details.action}</li>` : ''}
          ${details.resource ? `<li>资源: ${details.resource}</li>` : ''}
          ${details.ipAddress ? `<li>IP地址: ${details.ipAddress}</li>` : ''}
          ${details.userAgent ? `<li>用户代理: ${details.userAgent}</li>` : ''}
          ${details.timestamp ? `<li>时间戳: ${new Date(details.timestamp).toLocaleString()}</li>` : ''}
        </ul>
        <p>请及时检查系统安全状况。</p>
      </body>
      </html>
    `;
  },

  /**
   * 初始化安全告警服务
   */
  init() {
    // 检查必要的环境变量
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('缺少邮件配置，安全告警邮件功能将无法使用');
    }
    if (!process.env.ADMIN_EMAIL) {
      console.warn('未配置管理员邮箱，严重安全告警将无法发送给管理员');
    }
    console.log('安全告警服务已初始化');
  }
};

module.exports = securityAlertsService;