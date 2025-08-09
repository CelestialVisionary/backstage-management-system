const jwt = require('jsonwebtoken');
const User = require('../modules/users/models/userModel');
const Role = require('../modules/roles/models/roleModel');
const twoFactorService = require('../services/twoFactorService');

// 验证用户是否已登录
exports.protect = async (req, res, next) => {
  try {
    let token;

    // 检查请求头中是否有Authorization字段
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // 提取token
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        message: '您未登录，请先登录'
      });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 检查用户是否存在，并填充角色信息
    const currentUser = await User.findById(decoded.id).populate('role');
    if (!currentUser) {
      return res.status(401).json({
        message: '令牌所属的用户不存在'
      });
    }

    // 双因素认证检查
    if (currentUser.twoFactorEnabled) {
      // 检查请求中是否有双因素认证代码
      const twoFactorCode = req.headers['x-2fa-code'];
      if (!twoFactorCode) {
        return res.status(401).json({
          message: '请提供双因素认证代码'
        });
      }

      // 验证双因素认证代码
      const isVerified = twoFactorService.verifyToken(currentUser, twoFactorCode);
      if (!isVerified) {
        return res.status(401).json({
          message: '无效的双因素认证代码'
        });
      }
    }

    // 将用户信息添加到请求对象中
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({
      message: '无效的令牌'
    });
  }
};

// 限制特定角色的用户访问
exports.restrictTo = (...roleNames) => {
  return async (req, res, next) => {
    try {
      // 确保用户角色已填充
      if (!req.user.role || typeof req.user.role === 'string') {
        req.user = await User.findById(req.user._id).populate('role');
      }

      const userRoleName = req.user.role.name;
      if (!roleNames.includes(userRoleName)) {
        return res.status(403).json({
          message: '您没有权限执行此操作'
        });
      }
      next();
    } catch (error) {
      res.status(500).json({
        message: '权限检查失败'
      });
    }
  };
};

// 检查用户是否具有特定权限
exports.hasPermission = (...permissionRequirements) => {
  return async (req, res, next) => {
    try {
      // 确保用户角色已填充
      if (!req.user.role || typeof req.user.role === 'string') {
        req.user = await User.findById(req.user._id).populate('role');
      }

      // 检查用户角色是否有指定权限
      const userPermissions = req.user.role.permissions || [];

      // 权限要求可以是字符串或对象
      const hasAllPermissions = permissionRequirements.every(req => {
        if (typeof req === 'string') {
          // 简单权限检查（向后兼容）
          return userPermissions.some(perm => perm.name === req);
        } else if (typeof req === 'object') {
          // 细粒度权限检查
          const { module, action } = req;
          if (!module || !action) {
            throw new Error('权限要求必须包含模块和操作');
          }
          return userPermissions.some(perm =>
            perm.module === module && perm.action === action
          );
        }
        return false;
      });

      if (!hasAllPermissions) {
        return res.status(403).json({
          message: '您没有足够的权限执行此操作'
        });
      }
      next();
    } catch (error) {
      res.status(500).json({
        message: '权限检查失败',
        error: error.message
      });
    }
  };
};