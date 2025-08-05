const { cache, CACHE_KEYS } = require('../config/cacheConfig');

// 缓存中间件生成器
exports.cacheMiddleware = (cacheKey, ttl = 300) => {
  return (req, res, next) => {
    try {
      // 生成唯一的缓存键，考虑查询参数
      const uniqueCacheKey = `${cacheKey}:${JSON.stringify(req.query)}`;

      // 尝试从缓存获取数据
      const cachedData = cache.get(uniqueCacheKey);

      if (cachedData) {
        // 如果缓存命中，直接返回缓存的数据
        return res.json(cachedData);
      }

      // 缓存未命中，重写res.json方法以缓存响应
      const originalJson = res.json;
      res.json = function(data) {
        // 缓存数据
        cache.set(uniqueCacheKey, data, ttl);

        // 调用原始的json方法
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('缓存中间件错误:', error.message);
      next();
    }
  };
};

// 清除缓存的中间件
exports.clearCacheMiddleware = (...cacheKeys) => {
  return (req, res, next) => {
    try {
      // 等待请求处理完成
      const originalSend = res.send;
      res.send = function(data) {
        // 清除指定的缓存
        cacheKeys.forEach(key => {
          // 清除匹配前缀的所有缓存键
          const keys = cache.keys().filter(k => k.startsWith(key));
          if (keys.length > 0) {
            cache.del(keys);
          }
        });

        // 调用原始的send方法
        return originalSend.call(this, data);
      };

      next();
    } catch (error) {
      console.error('清除缓存中间件错误:', error.message);
      next();
    }
  };
};

// 清除所有缓存
exports.clearAllCache = () => {
  cache.flushAll();
  console.log('所有缓存已清除');
};