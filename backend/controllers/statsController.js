const User = require('../modules/users/models/userModel');
const mongoose = require('mongoose');
const Log = require('../modules/logs/models/logModel');
const moment = require('moment');

// 获取用户统计数据
exports.getUserStats = async (req, res) => {
  try {
    // 获取用户总数
    const totalUsers = await User.countDocuments();

    // 获取用户按角色分布 (优化版)
    const usersByRole = await User.aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'role',
          foreignField: '_id',
          as: 'roleInfo'
        }
      },
      {
        $unwind: '$roleInfo'
      },
      {
        $group: {
          _id: '$roleInfo.name',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          roleName: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // 获取用户注册趋势（按月份，优化版）
    const registrationTrend = await User.aggregate([
      {
        $project: {
          month: {
            $dateToString: {
              format: '%Y-%m',
              date: '$createdAt'
            }
          }
        }
      },
      {
        $group: {
          _id: '$month',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      },
      {
        $project: {
          month: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    res.json({
      totalUsers,
      usersByRole,
      registrationTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取系统概览统计 (优化版 - 并行查询)
exports.getSystemOverview = async (req, res) => {
  try {
    // 并行执行所有计数查询以提高效率
    const [totalUsers, totalRoles, totalLogs, totalErrors] = await Promise.all([
      User.countDocuments(),
      mongoose.model('Role').countDocuments(),
      Log.countDocuments(),
      Log.countDocuments({ isError: true })
    ]);

    res.json({
      totalUsers,
      totalRoles,
      totalLogs,
      totalErrors
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取活跃用户统计 (优化版)
exports.getActiveUsers = async (req, res) => {
  try {
    const { period } = req.query; // day, week, month
    let startDate;

    switch (period) {
      case 'day':
        startDate = moment().startOf('day').toDate();
        break;
      case 'week':
        startDate = moment().startOf('week').toDate();
        break;
      case 'month':
      default:
        startDate = moment().startOf('month').toDate();
        break;
    }

    // 并行执行查询以提高效率
    const [activeUsers, totalUsers] = await Promise.all([
      // 获取活跃用户（有登录记录的用户）
      Log.aggregate([
        { $match: { action: 'user:login', createdAt: { $gte: startDate } } },
        { $group: { _id: '$user' } },
        { $count: 'count' }
      ]),
      // 获取用户总数
      User.countDocuments()
    ]);

    const count = activeUsers.length > 0 ? activeUsers[0].count : 0;

    res.json({
      period,
      activeUsers: count,
      percentage: totalUsers > 0 ? Math.round((count / totalUsers) * 100) : 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取用户操作统计
exports.getUserActions = async (req, res) => {
  try {
    const actions = await Log.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      actions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取错误统计 (优化版)
exports.getErrorStats = async (req, res) => {
  try {
    // 并行执行两个聚合查询以提高效率
    const [errorTypes, errorTrend] = await Promise.all([
      // 错误类型分布
      Log.aggregate([
        { $match: { isError: true } },
        { $group: { _id: '$action', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: {
            action: '$_id',
            count: 1,
            _id: 0
          }
        }
      ]),
      // 错误时间趋势（按天）
      Log.aggregate([
        { $match: { isError: true } },
        { $project: {
            date: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
            }
          }
        },
        { $group: {
            _id: '$date',
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id': 1 } },
        { $limit: 30 },
        { $project: {
            date: '$_id',
            count: 1,
            _id: 0
          }
        }
      ])
    ]);

    res.json({
      errorTypes,
      errorTrend
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取用户增长预测
exports.getUserGrowthPrediction = async (req, res) => {
  try {
    // 获取过去6个月的用户增长数据
    const last6Months = await User.aggregate([
      { $match: {
          createdAt: { $gte: moment().subtract(6, 'months').startOf('month').toDate() }
        }
      },
      { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $project: {
          month: '$_id.month',
          year: '$_id.year',
          count: 1
        }
      }
    ]);

    // 简单线性回归预测未来3个月
    // 这里使用简单的预测方法，实际应用中可以使用更复杂的预测算法
    const predictions = [];
    if (last6Months.length >= 2) {
      // 计算平均增长率
      let totalGrowth = 0;
      for (let i = 1; i < last6Months.length; i++) {
        const prev = last6Months[i-1].count;
        const curr = last6Months[i].count;
        totalGrowth += (curr - prev) / prev;
      }
      const avgGrowthRate = totalGrowth / (last6Months.length - 1);

      // 生成未来3个月的预测
      let lastMonth = last6Months[last6Months.length - 1];
      let nextMonth = { ...lastMonth };

      for (let i = 0; i < 3; i++) {
        nextMonth.month += 1;
        if (nextMonth.month > 12) {
          nextMonth.month = 1;
          nextMonth.year += 1;
        }
        nextMonth.count = Math.round(nextMonth.count * (1 + avgGrowthRate));
        predictions.push({ ...nextMonth });
      }
    }

    res.json({
      historicalData: last6Months,
      predictions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};