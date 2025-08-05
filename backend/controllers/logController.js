const Log = require('../models/logModel');
const User = require('../models/userModel');

// 创建日志
exports.createLog = async (req, res) => {
  try {
    const { action, details } = req.body;

    const log = await Log.create({
      action,
      user: req.user._id,
      details,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent']
    });

    res.status(201).json(log);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取日志列表
exports.getLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action, user, startDate, endDate } = req.query;

    // 构建查询条件
    const query = {};
    if (action) query.action = action;
    if (user) query.user = user;
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    } else if (endDate) {
      query.createdAt = { $lte: new Date(endDate) };
    }

    // 计算跳过的记录数
    const skip = (page - 1) * limit;

    // 查询日志
    const logs = await Log.find(query)
      .populate('user', 'username email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // 获取总记录数
    const totalLogs = await Log.countDocuments(query);

    res.json({
      logs,
      totalPages: Math.ceil(totalLogs / limit),
      currentPage: Number(page),
      totalLogs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个日志
exports.getLog = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).populate('user', 'username email role');

    if (log) {
      res.json(log);
    } else {
      res.status(404).json({ message: '日志未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};