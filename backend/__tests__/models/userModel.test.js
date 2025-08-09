const mongoose = require('mongoose');
const User = require('../../models/userModel');
const Role = require('../../models/roleModel');

describe('User Model Test', () => {
  // 测试前创建一个角色
  beforeEach(async () => {
    const role = await Role.create({
      name: 'user',
      permissions: ['read:users']
    });
  });

  test('创建有效用户', async () => {
    const role = await Role.findOne({ name: 'user' });
    const userData = {
      username: 'testuser',
      email: 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
      role: role._id
    };

    const user = await User.create(userData);

    expect(user._id).toBeDefined();
    expect(user.username).toBe(userData.username);
    expect(user.email).toBe(userData.email);
    expect(user.role).toEqual(role._id);
    expect(user.password).not.toBe(userData.password); // 密码应该被加密
  });

  test('验证密码正确性', async () => {
    const role = await Role.findOne({ name: 'user' });
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: process.env.TEST_USER_PASSWORD || 'password123',
      role: role._id
    });

    // 需要获取包含密码的用户对象
    const userWithPassword = await User.findOne({ email: 'test@example.com' }).select('+password');

    const isCorrectPassword = await userWithPassword.correctPassword('password123', userWithPassword.password);
    const isIncorrectPassword = await userWithPassword.correctPassword('wrongpassword', userWithPassword.password);

    expect(isCorrectPassword).toBe(true);
    expect(isIncorrectPassword).toBe(false);
  });

  test('创建用户时缺少必填字段应该失败', async () => {
    const role = await Role.findOne({ name: 'user' });

    // 缺少用户名
    try {
      await User.create({
        email: 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'password123',
        role: role._id
      });
      expect(false).toBe(true); // 不应该执行到这里
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('请提供用户名');
    }

    // 缺少邮箱
    try {
      await User.create({
        username: 'testuser',
        password: process.env.TEST_USER_PASSWORD || 'password123',
        role: role._id
      });
      expect(false).toBe(true); // 不应该执行到这里
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('请提供邮箱');
    }

    // 缺少密码
    try {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        role: role._id
      });
      expect(false).toBe(true); // 不应该执行到这里
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('请提供密码');
    }

    // 缺少角色
    try {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: process.env.TEST_USER_PASSWORD || 'password123'
      });
      expect(false).toBe(true); // 不应该执行到这里
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('用户必须有一个角色');
    }
  });

  test('密码长度不足应该失败', async () => {
    const role = await Role.findOne({ name: 'user' });

    try {
      await User.create({
        username: 'testuser',
        email: 'test@example.com',
        password: '123', // 密码太短
        role: role._id
      });
      expect(false).toBe(true); // 不应该执行到这里
    } catch (error) {
      expect(error).toBeDefined();
      expect(error.message).toContain('密码长度不能少于6个字符');
    }
  });
});