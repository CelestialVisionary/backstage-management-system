const Role = require('../models/roleModel');
const User = require('../../users/models/userModel');

// 创建新角色
exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    // 检查角色是否已存在
    const roleExists = await Role.findOne({ name });
    if (roleExists) {
      return res.status(400).json({ message: '角色已存在' });
    }

    // 创建新角色
    const role = await Role.create({
      name,
      description,
      permissions
    });

    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取角色列表
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find({});
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 获取单个角色
exports.getRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);

    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ message: '角色未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 更新角色
exports.updateRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (role) {
      res.json(role);
    } else {
      res.status(404).json({ message: '角色未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 删除角色
exports.deleteRole = async (req, res) => {
  try {
    // 检查是否有用户正在使用该角色
    const usersWithRole = await User.findOne({ role: req.params.id });
    if (usersWithRole) {
      return res.status(400).json({ message: '该角色正在被用户使用，无法删除' });
    }

    const role = await Role.findByIdAndDelete(req.params.id);

    if (role) {
      res.json({ message: '角色已删除' });
    } else {
      res.status(404).json({ message: '角色未找到' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};