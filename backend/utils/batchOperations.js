const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const User = require('../modules/users/models/userModel');
const Role = require('../modules/roles/models/roleModel');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

// 批量导入用户
exports.importUsers = async (filePath) => {
  try {
    const results = [];
    const errors = [];
    let importedCount = 0;
    let skippedCount = 0;

    // 读取CSV文件
    await new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', resolve)
        .on('error', reject);
    });

    // 处理每一条用户数据
    for (const userData of results) {
      try {
        // 验证必填字段
        if (!userData.username || !userData.email || !userData.role) {
          skippedCount++;
          errors.push({
            row: userData,
            error: '缺少必填字段: username, email 或 role'
          });
          continue;
        }

        // 检查用户是否已存在
        const existingUser = await User.findOne({
          $or: [{ email: userData.email }, { username: userData.username }]
        });

        if (existingUser) {
          skippedCount++;
          errors.push({
            row: userData,
            error: '用户已存在'
          });
          continue;
        }

        // 查找角色
        const role = await Role.findOne({ name: userData.role });
        if (!role) {
          skippedCount++;
          errors.push({
            row: userData,
            error: `角色不存在: ${userData.role}`
          });
          continue;
        }

        // 生成随机密码
        const password = userData.password || crypto.randomBytes(12).toString('hex');

        // 创建用户
        await User.create({
          username: userData.username,
          email: userData.email,
          password: password,
          role: role._id
        });

        importedCount++;
      } catch (error) {
        skippedCount++;
        errors.push({
          row: userData,
          error: error.message
        });
      }
    }

    return {
      importedCount,
      skippedCount,
      totalCount: results.length,
      errors
    };
  } catch (error) {
    throw new Error(`导入用户失败: ${error.message}`);
  }
};

// 批量导出用户
exports.exportUsers = async (filter = {}, exportPath = null) => {
  try {
    // 查询用户
    const users = await User.find(filter).populate('role');

    // 转换用户数据为导出格式
    const exportData = users.map(user => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role.name,
      createdAt: user.createdAt.toISOString()
    }));

    // 如果没有提供导出路径，生成一个临时路径
    const outputPath = exportPath || path.join(__dirname, `../exports/users_${Date.now()}.csv`);

    // 设置CSV选项
    const csvFields = ['id', 'username', 'email', 'role', 'createdAt'];
    const json2csvParser = new Parser({ csvFields });
    const csvData = json2csvParser.parse(exportData);

    // 写入文件
    await fs.promises.writeFile(outputPath, csvData);

    return {
      exportedCount: users.length,
      filePath: outputPath
    };
  } catch (error) {
    throw new Error(`导出用户失败: ${error.message}`);
  }
};

// 批量分配角色
exports.batchAssignRoles = async (userIds, roleName) => {
  try {
    // 查找角色
    const role = await Role.findOne({ name: roleName });
    if (!role) {
      throw new Error(`角色不存在: ${roleName}`);
    }

    // 更新用户角色
    const result = await User.updateMany(
      { _id: { $in: userIds } },
      { role: role._id }
    );

    return {
      updatedCount: result.nModified,
      matchedCount: result.n
    };
  } catch (error) {
    throw new Error(`批量分配角色失败: ${error.message}`);
  }
};

// 批量删除用户
exports.batchDeleteUsers = async (userIds) => {
  try {
    // 删除用户
    const result = await User.deleteMany({ _id: { $in: userIds } });

    return {
      deletedCount: result.deletedCount
    };
  } catch (error) {
    throw new Error(`批量删除用户失败: ${error.message}`);
  }
};

// 批量处理数据 - 通用方法
exports.batchProcess = async (collection, filter, processor) => {
  try {
    // 查找符合条件的文档
    const documents = await collection.find(filter);
    const results = [];

    // 对每个文档应用处理函数
    for (const doc of documents) {
      const result = await processor(doc);
      results.push(result);
    }

    return {
      processedCount: documents.length,
      results
    };
  } catch (error) {
    throw new Error(`批量处理数据失败: ${error.message}`);
  }
};