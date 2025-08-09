const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Role = require('../../models/roleModel');
const User = require('../../models/userModel');
const roleController = require('../../controllers/roleController');
const authMiddleware = require('../../middleware/authMiddleware');

// 创建测试用的Express应用
const app = express();
app.use(express.json());

// 模拟路由
app.post('/api/roles', authMiddleware.protect, authMiddleware.restrictTo('admin'), roleController.createRole);
app.get('/api/roles', authMiddleware.protect, roleController.getRoles);
app.get('/api/roles/:id', authMiddleware.protect, roleController.getRole);
app.put('/api/roles/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), roleController.updateRole);
app.delete('/api/roles/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), roleController.deleteRole);

// 模拟authMiddleware中间件
jest.mock('../../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    req.user = { _id: 'testuserId', role: 'adminId' };
    next();
  },
  restrictTo: (...roles) => (req, res, next) => {
    next();
  },
  hasPermission: (permission) => (req, res, next) => {
    next();
  }
}));

// 模拟User模型
jest.mock('../../models/userModel', () => ({
  find: jest.fn().mockReturnThis(),
  countDocuments: jest.fn().mockResolvedValue(0)
}));

describe('Role Controller Integration Test', () => {
  let adminRole, testRole, token;

  // 测试前准备
  beforeEach(async () => {
    // 创建管理员角色
    adminRole = await Role.create({
      name: 'admin',
      permissions: ['read:roles', 'create:roles', 'update:roles', 'delete:roles']
    });

    // 创建测试角色
    testRole = await Role.create({
      name: 'editor',
      permissions: ['read:roles', 'update:roles']
    });

    // 创建管理员用户并获取token
    const adminUser = await User.create({
      username: 'adminuser',
      email: 'admin@example.com',
      password: 'admin123',
      role: adminRole._id
    });

    // 模拟登录获取token
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@example.com',
        password: 'admin123'
      });

    token = response.body.token;
  });

  // 清除测试数据
  afterEach(async () => {
    await Role.deleteMany({});
    await User.deleteMany({});
  });

  test('创建新角色', async () => {
    const response = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'viewer',
        permissions: ['read:roles']
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.name).toBe('viewer');
    expect(response.body.permissions).toEqual(['read:roles']);
  });

  test('创建已存在的角色应该失败', async () => {
    const response = await request(app)
      .post('/api/roles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'editor',
        permissions: ['read:roles']
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('角色已存在');
  });

  test('获取角色列表', async () => {
    const response = await request(app)
      .get('/api/roles')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2); // 应该有两个角色：admin和editor
  });

  test('获取单个角色', async () => {
    const response = await request(app)
      .get(`/api/roles/${testRole._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(testRole._id.toString());
    expect(response.body.name).toBe('editor');
    expect(response.body.permissions).toEqual(['read:roles', 'update:roles']);
  });

  test('获取不存在的角色应该失败', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/api/roles/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('角色未找到');
  });

  test('更新角色', async () => {
    const response = await request(app)
      .put(`/api/roles/${testRole._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'senior-editor',
        permissions: ['read:roles', 'update:roles', 'create:roles']
      });

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(testRole._id.toString());
    expect(response.body.name).toBe('senior-editor');
    expect(response.body.permissions).toEqual(['read:roles', 'update:roles', 'create:roles']);
  });

  test('删除角色', async () => {
    // 确保没有用户使用该角色
    User.find.mockReturnValueOnce({
      countDocuments: jest.fn().mockResolvedValue(0)
    });

    const response = await request(app)
      .delete(`/api/roles/${testRole._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('角色已删除');

    // 确认角色已被删除
    const deletedRole = await Role.findById(testRole._id);
    expect(deletedRole).toBeNull();
  });

  test('删除被用户使用的角色应该失败', async () => {
    // 模拟有用户使用该角色
    User.find.mockReturnValueOnce({
      countDocuments: jest.fn().mockResolvedValue(1)
    });

    const response = await request(app)
      .delete(`/api/roles/${testRole._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('该角色正在被用户使用，无法删除');
  });
});