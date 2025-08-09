const cacheService = require('../services/cacheService');
const User = require('../modules/users/models/userModel');
const Role = require('../modules/roles/models/roleModel');
const { CACHE_KEYS } = require('./cacheConfig');

// 缓存预热函数
async function warmupCache() {
  try {
    console.log('开始缓存预热...');

    // 预热用户列表
    const users = await User.find({}).lean();
    await cacheService.set(CACHE_KEYS.USER_LIST, users, 3600);
    console.log('用户列表已缓存');

    // 预热角色列表
    const roles = await Role.find({}).lean();
    await cacheService.set(CACHE_KEYS.ROLE_LIST, roles, 3600);
    console.log('角色列表已缓存');

    console.log('缓存预热完成');
  } catch (error) {
    console.error('缓存预热失败:', error.message);
  }
}

// 设置缓存失效策略
function setupCacheInvalidation() {
  console.log('设置缓存失效策略...');

  // 定时刷新用户列表缓存（每1小时）
  cacheService.setupRefreshInterval(
    CACHE_KEYS.USER_LIST,
    async () => await User.find({}).lean(),
    3600000
  );
  console.log('用户列表缓存刷新策略已设置');

  // 定时刷新角色列表缓存（每1小时）
  cacheService.setupRefreshInterval(
    CACHE_KEYS.ROLE_LIST,
    async () => await Role.find({}).lean(),
    3600000
  );
  console.log('角色列表缓存刷新策略已设置');
}

// 导出初始化函数
module.exports = { warmupCache, setupCacheInvalidation };