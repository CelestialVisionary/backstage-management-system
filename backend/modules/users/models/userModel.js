const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const Role = require('../../roles/models/roleModel');

// 加密配置
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key-here'; // 32字节
const IV_LENGTH = 16; // 对于aes-256-cbc

// 加密函数
function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// 解密函数
function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '请提供用户名'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, '请提供邮箱'],
    unique: true,
    trim: true,
    lowercase: true,
    set: encrypt,
    get: decrypt
  },
  password: {
    type: String,
    required: [true, '请提供密码'],
    minlength: [6, '密码长度不能少于6个字符'],
    select: false
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: [true, '用户必须有一个角色'],
    index: true
  },
  // 双因素认证相关字段
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  twoFactorSecret: String,
  twoFactorRecoveryCodes: [String],
  // IP白名单相关字段
  whitelistedIPs: [String],
  passwordResetToken: String,
  passwordResetExpires: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 密码加密中间件
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 验证密码方法
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// 生成密码重置令牌
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10分钟后过期
  
  return resetToken;
};

// 添加IP到白名单
userSchema.methods.addIpToWhitelist = function(ip) {
  if (!this.whitelistedIPs) {
    this.whitelistedIPs = [];
  }
  if (!this.whitelistedIPs.includes(ip)) {
    this.whitelistedIPs.push(ip);
  }
  return this.save();
};

// 从白名单中移除IP
userSchema.methods.removeIpFromWhitelist = function(ip) {
  if (this.whitelistedIPs) {
    this.whitelistedIPs = this.whitelistedIPs.filter(whitelistedIp => whitelistedIp !== ip);
  }
  return this.save();
};

// 清空IP白名单
userSchema.methods.clearIpWhitelist = function() {
  this.whitelistedIPs = [];
  return this.save();
};

// 静态方法：查找白名单中包含特定IP的用户
userSchema.statics.findUsersByWhitelistedIp = function(ip) {
  return this.find({ whitelistedIPs: ip });
};

const User = mongoose.model('User', userSchema);

module.exports = User;