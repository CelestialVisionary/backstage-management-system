const User = require('../modules/users/models/userModel');

/**
 * IP白名单中间件
 * 检查请求IP是否在用户的白名单中
 */
const ipWhitelistMiddleware = async (req, res, next) => {
  try {
    // 确保用户已认证
    if (!req.user) {
      return res.status(401).json({
        message: '您未登录，请先登录'
      });
    }

    // 刷新用户数据，确保获取最新的白名单
    const user = await User.findById(req.user._id);

    // 检查用户是否启用了IP白名单
    // 注意：这里我们假设将来会添加一个enableIpWhitelist字段
    // 目前先检查whitelistedIPs是否存在且不为空
    if (user.whitelistedIPs && user.whitelistedIPs.length > 0) {
      // 获取请求的IP地址
      const clientIP = req.ip || req.connection.remoteAddress;

      // 检查IP是否在白名单中
      if (!user.whitelistedIPs.includes(clientIP)) {
        return res.status(403).json({
          message: '您的IP地址不在白名单中，拒绝访问'
        });
      }
    }

    // IP验证通过，继续处理请求
    next();
  } catch (error) {
    console.error('IP白名单验证失败:', error.message);
    res.status(500).json({
      message: '服务器错误'
    });
  }
};

module.exports = ipWhitelistMiddleware;