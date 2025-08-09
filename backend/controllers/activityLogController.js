const ActivityLog = require('../modules/activityLogs/models/activityLogModel');
const User = require('../modules/users/models/userModel');
const securityAlertsService = require('../services/securityAlertsService');
const suspiciousActivityDetector = require('../utils/suspiciousActivityDetector');

// 创建活动日志
exports.createActivityLog = async (req, res, next) => {
  try {
    const { action, resource, details, status = 'success' } = req.body;
    const userId = req.user ? req.user.id : null;

    // 确定安全级别
    let securityLevel = 'info';
    if (action === 'failed_login' || action === 'suspicious_activity') {
      securityLevel = 'warning';
    } else if (action === 'data_export' || action === 'permission_change' || action === 'security_settings_change') {
      securityLevel = 'critical';
    }

    const activityLog = await ActivityLog.create({
      user: userId,
      action,
      resource,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      securityLevel,
      status,
      sessionId: req.sessionID || req.headers['x-session-id']
    });

    // 检测异常行为
    if (userId) {
      const isSuspicious = await suspiciousActivityDetector.detect(req.user.id, action, req.ip);
      if (isSuspicious) {
        // 发送安全告警
        await securityAlertsService.sendAlert({
          type: 'suspicious_activity',
          userId: req.user.id,
          details: {
            action,
            resource,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            timestamp: new Date()
          }
        });
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        activityLog
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取当前用户的活动日志
exports.getUserActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find({ user: req.user.id })
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await ActivityLog.countDocuments({ user: req.user.id });

    res.status(200).json({
      status: 'success',
      results: logs.length,
      page: parseInt(page),
      pages: Math.ceil(totalLogs / limit),
      total: totalLogs,
      data: {
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};

// 获取所有用户的活动日志（管理员）
exports.getAllActivityLogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, userId, action } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (userId) query.user = userId;
    if (action) query.action = action;

    const logs = await ActivityLog.find(query)
      .populate('user', 'username email')
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalLogs = await ActivityLog.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: logs.length,
      page: parseInt(page),
      pages: Math.ceil(totalLogs / limit),
      total: totalLogs,
      data: {
        logs
      }
    });
  } catch (error) {
    next(error);
  }
};

// 中间件：自动记录活动
exports.logActivity = (action, resource) => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        // 提取请求中的相关数据作为详情
        const details = {
          method: req.method,
          path: req.path,
          body: req.body,
          params: req.params
        };

        await ActivityLog.create({
          user: req.user.id,
          action,
          resource,
          details,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};