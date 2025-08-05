const express = require('express');
const connectDB = require('./db');
const { securityMiddleware } = require('./middleware/securityMiddleware');

// 导入Swagger相关模块
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./config/swaggerConfig');
require('dotenv').config();

// 初始化Express应用
const app = express();

// 配置安全中间件
app.use(securityMiddleware);

// 配置其他中间件
app.use(express.json());

// 连接数据库
connectDB();

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: '后台管理系统API' });
});

// 用户路由
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// 角色路由
const roleRoutes = require('./routes/roleRoutes');
app.use('/api/roles', roleRoutes);

// 统计路由
const statsRoutes = require('./routes/statsRoutes');
app.use('/api/stats', statsRoutes);

// 日志路由
const logRoutes = require('./routes/logRoutes');
app.use('/api/logs', logRoutes);

// 备份路由
const backupRoutes = require('./routes/backupRoutes');
app.use('/api/backups', backupRoutes);

// Swagger API文档路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// 导入备份工具
const backupUtils = require('./utils/backupUtils');

// 监听服务器
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
  // 启动自动备份
  backupUtils.startAutoBackup();
});