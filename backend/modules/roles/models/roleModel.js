const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '请提供角色名称'],
    unique: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  permissions: [{
    name: {
      type: String,
      required: [true, '权限名称不能为空'],
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    module: {
      type: String,
      required: [true, '权限所属模块不能为空'],
      trim: true
    },
    action: {
      type: String,
      required: [true, '权限操作不能为空'],
      trim: true
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Role = mongoose.model('Role', roleSchema);

module.exports = Role;