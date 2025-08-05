const mongoose = require('mongoose');
const Role = require('./models/roleModel');
require('dotenv').config();

// 连接数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('MongoDB 连接成功');
  initRoles();
})
.catch(err => {
  console.error('MongoDB 连接失败:', err.message);
  process.exit(1);
});

// 初始化角色
async function initRoles() {
  try {
    // 检查角色是否已存在
    const userRoleExists = await Role.findOne({ name: 'user' });
    const adminRoleExists = await Role.findOne({ name: 'admin' });

    if (userRoleExists && adminRoleExists) {
      console.log('角色已初始化');
      mongoose.connection.close();
      return;
    }

    // 创建用户角色
    if (!userRoleExists) {
      const userRole = await Role.create({
        name: 'user',
        description: '普通用户角色',
        permissions: ['read:own_data']
      });
      console.log('用户角色已创建:', userRole);
    }

    // 创建管理员角色
    if (!adminRoleExists) {
      const adminRole = await Role.create({
        name: 'admin',
        description: '管理员角色',
        permissions: ['read:all_data', 'create:data', 'update:data', 'delete:data', 'manage:users', 'manage:roles']
      });
      console.log('管理员角色已创建:', adminRole);
    }

    console.log('角色初始化成功');
    mongoose.connection.close();
  } catch (error) {
    console.error('角色初始化失败:', error.message);
    mongoose.connection.close();
  }
}

// 运行初始化函数