const User = require('../models/userModel');
const Role = require('../models/roleModel');
const jwt = require('jsonwebtoken');

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

// 更新用户
exports.updateUser = async (req, res) => {
  try {
    // 如果用户尝试更新密码
    if (req.body.password) {
      // 确保密码长度至少为6个字符
      if (req.body.password.length < 6) {
        return res.status(400).json({ message: '密码长度不能少于6个字符' });
      }
      // 我们不需要在这里手动加密密码，因为模型中的pre('save')中间件会处理
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
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