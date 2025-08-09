const Log = require('../modules/logs/models/logModel');

// 日志中间件
exports.logActions = (action) => {
  return async (req, res, next) => {
    try {
      // 等待请求处理完成
      const originalSend = res.send;
      res.send = function(data) {
        // 记录日志
        if (req.user) {
          const details = {
            requestBody: req.body,
            requestParams: req.params,
            requestQuery: req.query,
            responseStatus: res.statusCode,
            responseData: data.length > 1000 ? '数据过长，已截断' : data
          };

          Log.create({
            action,
            user: req.user._id,
            details,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
          }).catch(err => console.error('日志记录失败:', err.message));
        }

        // 调用原始的send方法
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('日志中间件错误:', error.message);
      next();
    }
  };
};

// 记录登录操作的中间件
exports.logLogin = async (req, res, next) => {
  try {
    // 等待请求处理完成
    const originalSend = res.send;
    res.send = function(data) {
      // 解析响应数据
      let responseData;
      try {
        responseData = JSON.parse(data);
      } catch (e) {
        responseData = data;
      }

      // 如果登录成功，则记录日志
      if (res.statusCode === 200 && responseData.token) {
        Log.create({
          action: 'user_login',
          user: responseData._id,
          details: {
            username: responseData.username,
            email: responseData.email,
            success: true
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }).catch(err => console.error('登录日志记录失败:', err.message));
      } else if (res.statusCode === 401) {
        // 记录登录失败
        Log.create({
          action: 'user_login_failed',
          user: null,
          details: {
            email: req.body.email,
            success: false,
            message: responseData.message || '登录失败'
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }).catch(err => console.error('登录失败日志记录失败:', err.message));
      }

      // 调用原始的send方法
      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    console.error('登录日志中间件错误:', error.message);
    next();
  }
};

// 记录注册操作的中间件
exports.logRegister = async (req, res, next) => {
  try {
    // 等待请求处理完成
    const originalSend = res.send;
    res.send = function(data) {
      // 解析响应数据
      let responseData;
      try {
        responseData = JSON.parse(data);
      } catch (e) {
        responseData = data;
      }

      // 如果注册成功，则记录日志
      if (res.statusCode === 201) {
        Log.create({
          action: 'user_register',
          user: responseData._id,
          details: {
            username: responseData.username,
            email: responseData.email,
            success: true
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }).catch(err => console.error('注册日志记录失败:', err.message));
      } else if (res.statusCode === 400) {
        // 记录注册失败
        Log.create({
          action: 'user_register_failed',
          user: null,
          details: {
            username: req.body.username,
            email: req.body.email,
            success: false,
            message: responseData.message || '注册失败'
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }).catch(err => console.error('注册失败日志记录失败:', err.message));
      }

      // 调用原始的send方法
      return originalSend.call(this, data);
    };

    next();
  } catch (error) {
    console.error('注册日志中间件错误:', error.message);
    next();
  }
};