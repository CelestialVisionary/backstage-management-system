const mongoose = require('mongoose');
const User = require('../../users/models/userModel');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '活动日志必须关联到用户']
  },
  action: {
    type: String,
    required: [true, '请提供操作类型'],
    enum: ['login', 'logout', 'create', 'update', 'delete', 'reset_password', 'change_password', 'access_resource', 'failed_login', 'suspicious_activity', 'data_export', 'permission_change', 'security_settings_change', 'two_factor_auth_change', 'ip_whitelist_change']
  },
  resource: {
    type: String,
    required: [true, '请提供操作资源']
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: {
    type: String,
    required: [true, '请提供IP地址']
  },
  userAgent: {
    type: String
  },
  securityLevel: {
    type: String,
    enum: ['info', 'warning', 'critical'],
    default: 'info'
  },
  status: {
    type: String,
    enum: ['success', 'failed'],
    default: 'success'
  },
  sessionId: {
    type: String
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// 创建索引以优化查询
// 用户和时间索引，用于按用户查询活动历史
activityLogSchema.index({ user: 1, timestamp: -1 });
// 操作类型和时间索引，用于按操作类型查询
activityLogSchema.index({ action: 1, timestamp: -1 });
// 资源类型索引，用于按资源查询
activityLogSchema.index({ resource: 1 });
// 复合索引，用于复杂统计查询
activityLogSchema.index({ user: 1, action: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = ActivityLog;