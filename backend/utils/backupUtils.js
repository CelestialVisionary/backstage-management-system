const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const backupConfig = require('../config/backupConfig');
const logModel = require('../modules/logs/models/logModel');

// 确保备份目录存在
function ensureBackupDirExists() {
  if (!fs.existsSync(backupConfig.backupDir)) {
    fs.mkdirSync(backupConfig.backupDir, { recursive: true });
    console.log(`备份目录已创建: ${backupConfig.backupDir}`);
  }
}

// 创建数据库备份
async function createBackup() {
  try {
    ensureBackupDirExists();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupConfig.backupDir, `backup-${timestamp}`);
    const dbUri = backupConfig.dbConfig.uri;

    // 使用mongodump命令创建备份
    execSync(`mongodump --uri="${dbUri}" --out="${backupPath}"`, {
      stdio: 'ignore'
    });

    console.log(`数据库备份成功: ${backupPath}`);

    // 记录备份日志
    await logModel.create({
      action: 'backup:create',
      user: '6892c75b3c3e22c1f1be69ab', // 使用管理员角色ID作为系统操作的用户
      details: { backupPath }
    });

    // 清理旧备份
    cleanupOldBackups();

    return { success: true, backupPath };
  } catch (error) {
    console.error('数据库备份失败:', error.message);

    // 记录错误日志
    await logModel.create({
      action: 'backup:create',
      user: '6892c75b3c3e22c1f1be69ab', // 使用管理员角色ID作为系统操作的用户
      details: { error: error.message },
      isError: true
    });

    return { success: false, error: error.message };
  }
}

// 恢复数据库备份
async function restoreBackup(backupPath) {
  try {
    if (!fs.existsSync(backupPath)) {
      throw new Error(`备份路径不存在: ${backupPath}`);
    }

    const dbUri = backupConfig.dbConfig.uri;

    // 使用mongorestore命令恢复备份
    execSync(`mongorestore --uri="${dbUri}" "${backupPath}"`, {
      stdio: 'ignore'
    });

    console.log(`数据库恢复成功: ${backupPath}`);

    // 记录恢复日志
    await logModel.create({
      action: 'backup:restore',
      user: 'system',
      details: { backupPath }
    });

    return { success: true };
  } catch (error) {
    console.error('数据库恢复失败:', error.message);

    // 记录错误日志
    await logModel.create({
      action: 'backup:restore',
      user: 'system',
      details: { error: error.message },
      isError: true
    });

    return { success: false, error: error.message };
  }
}

// 清理旧备份
function cleanupOldBackups() {
  try {
    const backups = fs.readdirSync(backupConfig.backupDir)
      .map(file => path.join(backupConfig.backupDir, file))
      .filter(file => fs.statSync(file).isDirectory())
      .sort((a, b) => fs.statSync(b).mtime.getTime() - fs.statSync(a).mtime.getTime());

    if (backups.length > backupConfig.keepBackups) {
      const backupsToDelete = backups.slice(backupConfig.keepBackups);
      backupsToDelete.forEach(backup => {
        // 递归删除目录
        function deleteDir(dir) {
          if (fs.existsSync(dir)) {
            fs.readdirSync(dir).forEach((file) => {
              const curPath = path.join(dir, file);
              if (fs.lstatSync(curPath).isDirectory()) {
                deleteDir(curPath);
              } else {
                fs.unlinkSync(curPath);
              }
            });
            fs.rmdirSync(dir);
          }
        }

        deleteDir(backup);
        console.log(`已删除旧备份: ${backup}`);
      });
    }
  } catch (error) {
    console.error('清理旧备份失败:', error.message);
  }
}

// 启动自动备份
function startAutoBackup() {
  // 立即执行一次备份
  createBackup();

  // 设置定时备份
  const interval = backupConfig.backupInterval * 60 * 1000;
  setInterval(createBackup, interval);
  console.log(`自动备份已启动，每 ${backupConfig.backupInterval} 分钟执行一次`);
}

module.exports = {
  createBackup,
  restoreBackup,
  startAutoBackup
};