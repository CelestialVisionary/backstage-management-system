const User = require('../models/userModel');
const Role = require('../models/roleModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// 注册新用户
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否已存在
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: '用户已存在' });
    }

    // 查找默认角色
    const defaultRole = await Role.findOne({ name: 'user' });
    if (!defaultRole) {
      return res.status(500).json({ message: '默认角色不存在，请先创建角色' });
    }

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      role: defaultRole._id
    });

    if (user) {
      // 填充角色信息以返回
      const populatedUser = await User.findById(user._id).populate('role');
      res.status(201).json({
        _id: populatedUser._id,
        username: populatedUser.username,
        email: populatedUser.email,
        role: populatedUser.role,
        token: generateToken(populatedUser._id)
      });
    } else {
      res.status(400).json({ message: '无效的用户数据' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 用户登录
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 检查用户是否存在
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.correctPassword(password, user.password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: '邮箱或密码不正确' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取用户列表
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个用户
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: '用户未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新个人资料
exports.updateProfile = async (req, res) => {
  try {
    // 只允许更新这些字段
    const allowedFields = ['username', 'email', 'password'];
    const updateData = {};

    // 过滤请求体中的字段
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    // 如果用户尝试更新密码
    if (updateData.password) {
      // 确保密码长度至少为6个字符
      if (updateData.password.length < 6) {
        return res.status(400).json({ message: '密码长度不能少于6个字符' });
      }
    }

    // 使用当前认证用户的ID
    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    }).populate('role');

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(404).json({ message: '用户未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (user) {
      res.json({ message: '用户已删除' });
    } else {
      res.status(404).json({ message: '用户未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 请求密码重置
exports.forgotPassword = async (req, res) => {
  try {
    // 1. 获取用户邮箱
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: '该邮箱未注册' });
    }
    
    // 2. 生成密码重置令牌
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // 3. 发送重置邮件
    const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
    const message = `您请求重置密码，请点击以下链接：${resetURL}。链接将在10分钟后过期。`;
    
    // 配置邮件传输
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    await transporter.sendMail({
      from: '后台管理系统 <noreply@example.com>',
      to: user.email,
      subject: '密码重置请求',
      text: message
    });
    
    res.status(200).json({
      message: '密码重置链接已发送到您的邮箱'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.status(500).json({
      message: '发送密码重置邮件失败，请稍后再试'
    });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    // 1. 根据令牌查找用户
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: '令牌无效或已过期' });
    }
    
    // 2. 设置新密码
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // 3. 生成新的JWT令牌
    res.status(200).json({
      message: '密码重置成功',
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

// 搜索和筛选用户
exports.searchUsers = async (req, res) => {
  try {
    const { keyword, role, page = 1, limit = 10 } = req.query;
    const query = {};

    // 关键词搜索 (用户名或邮箱)
    if (keyword) {
      query.$or = [
        { username: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } }
      ];
    }

    // 角色筛选
    if (role) {
      // 查找角色ID
      const roleDoc = await Role.findOne({ name: role });
      if (roleDoc) {
        query.role = roleDoc._id;
      } else {
        return res.status(400).json({ message: '无效的角色名称' });
      }
    }

    // 计算跳过的记录数
    const skip = (page - 1) * limit;

    // 搜索用户并分页
    const users = await User.find(query)
      .populate('role')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    // 获取总记录数
    const totalUsers = await User.countDocuments(query);

    res.json({
      users,
      page: parseInt(page),
      pages: Math.ceil(totalUsers / limit),
      total: totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (user) {
      res.json({ message: '用户已删除' });
    } else {
      res.status(404).json({ message: '用户未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 请求密码重置
exports.forgotPassword = async (req, res) => {
  try {
    // 1. 获取用户邮箱
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: '该邮箱未注册' });
    }
    
    // 2. 生成密码重置令牌
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    
    // 3. 发送重置邮件
    const resetURL = `${req.protocol}://${req.get('host')}/api/users/resetPassword/${resetToken}`;
    const message = `您请求重置密码，请点击以下链接：${resetURL}。链接将在10分钟后过期。`;
    
    // 配置邮件传输
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });
    
    await transporter.sendMail({
      from: '后台管理系统 <noreply@example.com>',
      to: user.email,
      subject: '密码重置请求',
      text: message
    });
    
    res.status(200).json({
      message: '密码重置链接已发送到您的邮箱'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    
    res.status(500).json({
      message: '发送密码重置邮件失败，请稍后再试'
    });
  }
};

// 重置密码
exports.resetPassword = async (req, res) => {
  try {
    // 1. 根据令牌查找用户
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ message: '令牌无效或已过期' });
    }
    
    // 2. 设置新密码
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    // 3. 生成新的JWT令牌
    res.status(200).json({
      message: '密码重置成功',
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};