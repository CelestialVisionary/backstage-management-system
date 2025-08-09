const backupService = require('../services/backupService');
const dataMasking = require('../utils/dataMasking');
const fs = require('fs');
const path = require('path');

// 创建备份
exports.createBackup = async (req, res) => {
  try {
    const { collectionName } = req.query;
    const backupPath = await backupService.backupDatabase(collectionName);
    res.status(201).json({
      success: true,
      message: '备份创建成功',
      backupPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 数据脱敏示例
exports.maskDataExample = (req, res) => {
  try {
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        message: '请提供脱敏类型和数据'
      });
    }

    let maskedData;
    switch (type) {
      case 'email':
        maskedData = dataMasking.maskEmail(data);
        break;
      case 'phone':
        maskedData = dataMasking.maskPhone(data);
        break;
      case 'idCard':
        maskedData = dataMasking.maskIdCard(data);
        break;
      case 'bankCard':
        maskedData = dataMasking.maskBankCard(data);
        break;
      default:
        maskedData = dataMasking.maskCustom(data);
    }

    res.status(200).json({
      success: true,
      data: {
        original: data,
        masked: maskedData
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 恢复备份
exports.restoreBackup = async (req, res) => {
  try {
    const { backupPath } = req.body;
    const { dropCollection } = req.query;

    if (!backupPath) {
      return res.status(400).json({
        success: false,
        message: '缺少备份路径'
      });
    }

    await backupService.restoreDatabase(backupPath, dropCollection !== 'false');
    res.status(200).json({
      success: true,
      message: '备份恢复成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 设置自动备份
exports.setAutoBackup = (req, res) => {
  try {
    const { interval, collectionName } = req.body;
    backupService.autoBackup(interval, collectionName);
    res.status(200).json({
      success: true,
      message: '自动备份已设置'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取备份列表
exports.getBackups = (req, res) => {
  try {
    const backups = fs.readdirSync(backupConfig.backupDir)
      .map(file => {
        const filePath = path.join(backupConfig.backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          createdAt: stats.ctime,
          size: stats.size
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt);

    res.status(200).json({
      success: true,
      backups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '获取备份列表失败',
      error: error.message
    });
  }
};

// 删除备份
exports.deleteBackup = (req, res) => {
  try {
    const { backupPath } = req.body;

    if (!backupPath) {
      return res.status(400).json({
        success: false,
        message: '缺少备份路径'
      });
    }

    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({
        success: false,
        message: '备份不存在'
      });
    }

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

    deleteDir(backupPath);

    res.status(200).json({
      success: true,
      message: '备份删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '删除备份失败',
      error: error.message
    });
  }
};