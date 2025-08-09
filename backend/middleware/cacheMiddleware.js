const cacheService = require('../services/cacheService');
const { CACHE_KEYS } = require('../config/cacheConfig');

// 用于请求合并的等待队列
const requestQueue = new Map();

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 缓存中间件生成器 - 带请求合并功能
exports.cacheMiddleware = (cacheKey, ttl = 300, mergeTimeout = 50) => {
  return async (req, res, next) => {
    try {
      // 生成唯一的缓存键，考虑查询参数
      const uniqueCacheKey = `${cacheKey}:${JSON.stringify(req.query)}`;

      // 尝试从缓存获取数据
      const cachedData = await cacheService.get(uniqueCacheKey);

      if (cachedData) {
        // 如果缓存命中，直接返回缓存的数据
        return res.json(cachedData);
      }

      // 检查是否有相同的请求正在处理
      if (requestQueue.has(uniqueCacheKey)) {
        // 如果有，加入等待队列
        console.log(`请求合并: ${uniqueCacheKey}`);
        const waitPromise = new Promise(resolve => {
          requestQueue.get(uniqueCacheKey).push(resolve);
        });
        // 等待结果
        const data = await waitPromise;
        return res.json(data);
      }

      // 如果没有，创建一个新的等待队列
      requestQueue.set(uniqueCacheKey, []);

      // 缓存未命中，重写res.json方法以缓存响应
      const originalJson = res.json;
      res.json = async function(data) {
        // 缓存数据
        await cacheService.set(uniqueCacheKey, data, ttl);

        // 通知所有等待的请求
        if (requestQueue.has(uniqueCacheKey)) {
          const resolvers = requestQueue.get(uniqueCacheKey);
          resolvers.forEach(resolve => resolve(data));
          // 移除队列
          requestQueue.delete(uniqueCacheKey);
        }

        // 调用原始的json方法
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('缓存中间件错误:', error.message);
      // 发生错误时，清空等待队列
      const uniqueCacheKey = `${cacheKey}:${JSON.stringify(req.query)}`;
      if (requestQueue.has(uniqueCacheKey)) {
        requestQueue.delete(uniqueCacheKey);
      }
      next();
    }
  };
};

// 清除缓存的中间件
exports.clearCacheMiddleware = (...cacheKeys) => {
  return async (req, res, next) => {
    try {
      // 等待请求处理完成
      const originalSend = res.send;
      res.send = async function(data) {
        // 清除指定的缓存
        cacheKeys.forEach(async key => {
          // 清除匹配前缀的所有缓存键
          // 注意：在Redis中，这需要特殊处理，这里简化实现
          console.log(`清除缓存前缀: ${key}`);
          await cacheService.del(key);
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
exports.clearAllCache = async () => {
  await cacheService.flushAll();
  console.log('所有缓存已清除');
};