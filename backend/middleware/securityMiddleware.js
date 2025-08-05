const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');

// 配置速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP最多100个请求
  message: '请求过于频繁，请稍后再试',
  standardHeaders: true,
  legacyHeaders: false
});

// 安全中间件集合
exports.securityMiddleware = [
  // 设置安全HTTP头
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"] ,
        scriptSrc: ["'self'", "'unsafe-inline'"] ,
        styleSrc: ["'self'", "'unsafe-inline'"] ,
        imgSrc: ["'self'", "data:"] ,
        fontSrc: ["'self'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  }),

  // 限制请求速率
  limiter,

  // 防止XSS攻击
  xss(),

  // 防止HTTP参数污染
  hpp(),

  // 启用CORS
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  })
];