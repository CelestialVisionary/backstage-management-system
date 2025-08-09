const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

/**
 * 数据备份和恢复服务
 */
const backupService = {
  /**
   * 创建备份目录
   * @returns {string} 备份目录路径
   */
  createBackupDir() {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    return backupDir;
  },

  /**
   * 备份数据库
   * @param {string} collectionName - 集合名称，可选，默认为所有集合
   * @returns {Promise<string>} 备份文件路径
   */
  async backupDatabase(collectionName = null) {
    try {
      const backupDir = this.createBackupDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = collectionName
        ? `${collectionName}-${timestamp}.json`
        : `full-backup-${timestamp}.json`;
      const backupPath = path.join(backupDir, filename);

      // 获取所有集合名称
      const collections = collectionName
        ? [collectionName]
        : Object.keys(mongoose.connection.collections);

      const backupData = {};

      // 备份每个集合的数据
      for (const collName of collections) {
        const collection = mongoose.connection.collection(collName);
        const data = await collection.find({}).toArray();
        backupData[collName] = data;
      }

      // 写入备份文件
      fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
      console.log(`数据库备份成功: ${backupPath}`);
      return backupPath;
    } catch (error) {
      console.error('数据库备份失败:', error);
      throw new Error(`备份数据库时出错: ${error.message}`);
    }
  },

  /**
   * 从备份文件恢复数据库
   * @param {string} backupPath - 备份文件路径
   * @param {boolean} dropCollection - 是否删除现有集合数据
   * @returns {Promise<void>}
   */
  async restoreDatabase(backupPath, dropCollection = true) {
    try {
      // 检查备份文件是否存在
      if (!fs.existsSync(backupPath)) {
        throw new Error(`备份文件不存在: ${backupPath}`);
      }

      // 读取备份数据
      const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

      // 恢复每个集合的数据
      for (const [collName, data] of Object.entries(backupData)) {
        const collection = mongoose.connection.collection(collName);

        // 如果需要删除现有数据
        if (dropCollection) {
          await collection.deleteMany({});
        }

        // 插入备份数据
        if (data.length > 0) {
          await collection.insertMany(data);
        }
      }

      console.log(`数据库恢复成功: ${backupPath}`);
    } catch (error) {
      console.error('数据库恢复失败:', error);
      throw new Error(`恢复数据库时出错: ${error.message}`);
    }
  },

  /**
   * 获取所有备份文件
   * @returns {string[]} 备份文件列表
   */
  getBackupFiles() {
    const backupDir = this.createBackupDir();
    return fs
      .readdirSync(backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.join(backupDir, file));
  },

  /**
   * 自动定期备份
   * @param {number} interval - 备份间隔(毫秒)
   * @param {string} collectionName - 集合名称，可选
   */
  autoBackup(interval = 24 * 60 * 60 * 1000, collectionName = null) {
    // 立即执行一次备份
    this.backupDatabase(collectionName);

    // 设置定时备份
    setInterval(() => {
      this.backupDatabase(collectionName);
    }, interval);

    console.log(`已设置自动备份，间隔: ${interval / (60 * 60 * 1000)}小时`);
  }
};

module.exports = backupService;