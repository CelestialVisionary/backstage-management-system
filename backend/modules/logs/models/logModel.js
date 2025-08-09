const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  action: {
    type: String,
    required: [true, '请提供操作类型'],
    trim: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '请提供操作用户']
  },
  details: {
    type: Object,
    default: {}
  },
  ipAddress: {
    type: String,
    trim: true
  },
  userAgent: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 创建索引以优化查询性能
// 用户和时间索引，用于按用户查询历史记录
logSchema.index({ user: 1, createdAt: -1 });
// 操作类型和时间索引，用于按操作类型查询
logSchema.index({ action: 1, createdAt: -1 });
// IP地址索引，用于按IP查询
logSchema.index({ ipAddress: 1 });
// 复合索引，用于统计查询
logSchema.index({ action: 1, user: 1, createdAt: -1 });

const Log = mongoose.model('Log', logSchema);

module.exports = Log;