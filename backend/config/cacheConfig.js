const NodeCache = require('node-cache');

// 创建缓存实例
const cache = new NodeCache({
  stdTTL: 300, // 默认过期时间(秒)
  checkperiod: 60, // 检查过期键的周期(秒)
  useClones: false // 不使用克隆，提高性能
});

// 缓存键前缀，避免键冲突
const CACHE_KEYS = {
  USER_LIST: 'users:list',
  USER_DETAIL: 'users:detail',
  ROLE_LIST: 'roles:list',
  ROLE_DETAIL: 'roles:detail',
  STATS_OVERVIEW: 'stats:overview',
  USER_STATS: 'stats:users',
  USER_ACTIONS: 'stats:userActions',
  ERROR_STATS: 'stats:errors',
  GROWTH_PREDICTION: 'stats:growthPrediction'
};

module.exports = {
  cache,
  CACHE_KEYS
};