const redisClient = require('../config/redisConfig');
const { cache: localCache, CACHE_KEYS } = require('../config/cacheConfig');

// 缓存服务类
class CacheService {
  constructor() {
    this.redisClient = redisClient;
    this.localCache = localCache;
    this.CACHE_KEYS = CACHE_KEYS;
  }

  // 获取缓存
  async get(key) {
    try {
      // 尝试从Redis获取
      const redisData = await this.redisClient.get(key);
      if (redisData) {
        return JSON.parse(redisData);
      }

      // Redis未命中，从本地缓存获取
      return this.localCache.get(key);
    } catch (error) {
      console.error('获取缓存失败:', error.message);
      // 发生错误时，尝试从本地缓存获取
      return this.localCache.get(key);
    }
  }

  // 设置缓存
  async set(key, value, ttl = 300) {
    try {
      // 同时设置到Redis和本地缓存
      await this.redisClient.set(key, JSON.stringify(value), {
        EX: ttl
      });
      this.localCache.set(key, value, ttl);
      return true;
    } catch (error) {
      console.error('设置缓存失败:', error.message);
      // 发生错误时，只设置本地缓存
      this.localCache.set(key, value, ttl);
      return false;
    }
  }

  // 删除缓存
  async del(key) {
    try {
      // 同时从Redis和本地缓存删除
      await this.redisClient.del(key);
      this.localCache.del(key);
      return true;
    } catch (error) {
      console.error('删除缓存失败:', error.message);
      // 发生错误时，只删除本地缓存
      this.localCache.del(key);
      return false;
    }
  }

  // 清除所有缓存
  async flushAll() {
    try {
      // 同时清除Redis和本地缓存
      await this.redisClient.flushAll();
      this.localCache.flushAll();
      return true;
    } catch (error) {
      console.error('清除所有缓存失败:', error.message);
      // 发生错误时，只清除本地缓存
      this.localCache.flushAll();
      return false;
    }
  }

  // 缓存预热
  async warmup() {
    try {
      console.log('开始缓存预热...');
      // 这里可以添加需要预热的缓存数据
      // 例如：预加载用户列表、角色列表等
      console.log('缓存预热完成');
      return true;
    } catch (error) {
      console.error('缓存预热失败:', error.message);
      return false;
    }
  }

  // 缓存失效策略 - 定时刷新
  setupRefreshInterval(key, refreshFunction, interval = 3600000) {
    // 立即执行一次
    refreshFunction()
      .then(data => this.set(key, data))
      .catch(err => console.error(`刷新缓存 ${key} 失败:`, err.message));

    // 设置定时器
    return setInterval(async () => {
      try {
        const data = await refreshFunction();
        await this.set(key, data);
      } catch (error) {
        console.error(`刷新缓存 ${key} 失败:`, error.message);
      }
    }, interval);
  }
}

// 导出缓存服务实例
module.exports = new CacheService();