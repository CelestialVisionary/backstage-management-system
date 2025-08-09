const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../models/userModel');
const Role = require('../../models/roleModel');
const userController = require('../../controllers/userController');
const authMiddleware = require('../../middleware/authMiddleware');

// 创建测试用的Express应用
const app = express();
app.use(express.json());

// 模拟路由
app.post('/api/users', userController.registerUser);
app.post('/api/users/login', userController.loginUser);
app.get('/api/users', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.getUsers);
app.get('/api/users/:id', authMiddleware.protect, userController.getUser);
app.put('/api/users/:id', authMiddleware.protect, userController.updateUser);
app.delete('/api/users/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), userController.deleteUser);

// 模拟authMiddleware.protect中间件，用于测试需要认证的路由
jest.mock('../../middleware/authMiddleware', () => ({
  protect: (req, res, next) => {
    // 模拟认证用户
    req.user = { _id: 'testuserId', role: 'adminId' };
    next();
  },
  restrictTo: (...roles) => (req, res, next) => {
    // 模拟权限检查
    next();
  },
  hasPermission: (permission) => (req, res, next) => {
    // 模拟权限检查
    next();
  }
}));

describe('User Controller Integration Test', () => {
  let adminRole, userRole, testUser, adminUser, token;

  // 测试前创建角色和用户
  beforeEach(async () => {
    // 创建角色
    adminRole = await Role.create({
      name: 'admin',
      permissions: ['read:users', 'create:users', 'update:users', 'delete:users']
    });

    userRole = await Role.create({
      name: 'user',
      permissions: ['read:users']
    });

    // 创建测试用户
    testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
      role: userRole._id
    });

    // 创建管理员用户
    adminUser = await User.create({
      username: 'adminuser',
      email: 'admin@example.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'admin123',
      role: adminRole._id
    });

    // 获取管理员用户的token
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'admin@example.com',
        password: process.env.TEST_ADMIN_PASSWORD || 'admin123'
      });

    token = response.body.token;
  });

  test('注册新用户', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        username: 'newuser',
        email: 'new@example.com',
        password: process.env.TEST_NEW_PASSWORD || 'newpassword123'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.username).toBe('newuser');
    expect(response.body.email).toBe('new@example.com');
    expect(response.body).toHaveProperty('token');
  });

  test('注册已存在的用户应该失败', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'password123'
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('用户已存在');
  });

  test('用户登录', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'password123'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.username).toBe('testuser');
    expect(response.body.email).toBe('test@example.com');
    expect(response.body).toHaveProperty('token');
  });

  test('使用错误的密码登录应该失败', async () => {
    const response = await request(app)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('邮箱或密码不正确');
  });

  test('获取用户列表', async () => {
    const response = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(2); // 应该有两个用户：testuser和adminuser
  });

  test('获取单个用户', async () => {
    const response = await request(app)
      .get(`/api/users/${testUser._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(testUser._id.toString());
    expect(response.body.username).toBe('testuser');
    expect(response.body.email).toBe('test@example.com');
  });

  test('获取不存在的用户应该失败', async () => {
    const nonExistentId = new mongoose.Types.ObjectId();
    const response = await request(app)
      .get(`/api/users/${nonExistentId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe('用户未找到');
  });

  test('更新用户', async () => {
    const response = await request(app)
      .put(`/api/users/${testUser._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        username: 'updateduser',
        email: 'updated@example.com'
      });

    expect(response.status).toBe(200);
    expect(response.body._id).toBe(testUser._id.toString());
    expect(response.body.username).toBe('updateduser');
    expect(response.body.email).toBe('updated@example.com');
  });

  test('删除用户', async () => {
    const response = await request(app)
      .delete(`/api/users/${testUser._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('用户已删除');

    // 确认用户已被删除
    const deletedUser = await User.findById(testUser._id);
    expect(deletedUser).toBeNull();
  });
});