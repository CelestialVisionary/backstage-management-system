const redis = require('redis');
require('dotenv').config();

// 创建Redis客户端
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    connectTimeout: 5000
  }
});

// 处理连接错误
redisClient.on('error', (err) => {
  console.error('Redis连接错误:', err.message);
});

// 连接到Redis
redisClient.connect()
  .then(() => {
    console.log('Redis连接成功');
  })
  .catch((err) => {
    console.error('Redis连接失败:', err.message);
  });

// 导出Redis客户端
module.exports = redisClient;