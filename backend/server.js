const express = require('express');
const connectDB = require('./db');
const { securityMiddleware } = require('./middleware/securityMiddleware');
// 导入数据压缩中间件
const compression = require('compression');

// 导入Swagger相关模块
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swaggerConfig');
require('dotenv').config();

// 初始化Express应用
const app = express();

// 配置安全中间件
app.use(securityMiddleware);

// 配置数据压缩中间件
app.use(compression());

// 配置其他中间件
app.use(express.json());

// 连接数据库
connectDB();

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: '后台管理系统API' });
});

// 用户路由
const userRoutes = require('./modules/users/routes/userRoutes');
app.use('/api/users', userRoutes);

// 用户安全路由
const securityRoutes = require('./modules/users/routes/securityRoutes');
app.use('/api/users/security', securityRoutes);

// 角色路由
const roleRoutes = require('./modules/roles/routes/roleRoutes');
app.use('/api/roles', roleRoutes);

// 统计路由
const statsRoutes = require('./routes/statsRoutes');
app.use('/api/stats', statsRoutes);

// 日志路由
const logRoutes = require('./routes/logRoutes');
app.use('/api/logs', logRoutes);

// 活动日志路由
const activityLogRoutes = require('./routes/activityLogRoutes');
app.use('/api/activity-logs', activityLogRoutes);

// 备份路由
const backupRoutes = require('./routes/backupRoutes');
app.use('/api/backups', backupRoutes);

// Swagger API文档路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 导入备份服务
const backupService = require('./services/backupService');

// 导入安全告警服务
const securityAlertsService = require('./services/securityAlertsService');

// 导入缓存初始化工具
const { warmupCache, setupCacheInvalidation } = require('./config/initCache');

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    message: '服务器错误',
    error: process.env.NODE_ENV === 'development' ? err.message : '请联系管理员'
  });
});

// 监听服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  // 启动自动备份 - 每天备份一次
  backupService.autoBackup(24 * 60 * 60 * 1000);

  // 初始化安全告警服务
  securityAlertsService.init();

  // 初始化缓存
  await warmupCache();
  setupCacheInvalidation();
});