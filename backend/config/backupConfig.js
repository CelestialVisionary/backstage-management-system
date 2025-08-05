const path = require('path');

module.exports = {
  // 备份目录
  backupDir: path.join(__dirname, '../../backups'),
  // 备份频率（分钟）
  backupInterval: 60, // 每小时备份一次
  // 保留的备份数量
  keepBackups: 7, // 保留最近7个备份
  // 数据库连接配置
  dbConfig: {
    uri: 'mongodb://localhost:27017/backstage_management',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  }
};