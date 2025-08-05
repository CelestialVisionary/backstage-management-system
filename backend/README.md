# 后台管理系统 - 后端API

## 技术栈
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (身份验证)

## 功能模块
1. 用户管理
2. 角色管理
3. 权限管理
4. 数据统计
5. 日志管理

## 系统初始化

### 1. 安装依赖
```bash
cd backend
npm install
```

### 2. 配置环境变量
创建`.env`文件，添加以下环境变量：
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/backstage_management
JWT_SECRET=your_jwt_secret_key
CORS_ORIGIN=http://localhost:8000
```

### 3. 初始化角色
首次运行系统前，需要初始化默认角色（user和admin）：
```bash
node initRoles.js
```

### 4. 启动服务器
```bash
node server.js
```

## API文档

### 用户API
- `POST /api/users/register` - 注册新用户
- `POST /api/users/login` - 用户登录
- `GET /api/users` - 获取用户列表 (管理员)
- `GET /api/users/:id` - 获取单个用户
- `PUT /api/users/:id` - 更新用户
- `DELETE /api/users/:id` - 删除用户 (管理员)

### 角色API
- `POST /api/roles` - 创建新角色 (管理员)
- `GET /api/roles` - 获取角色列表
- `GET /api/roles/:id` - 获取单个角色
- `PUT /api/roles/:id` - 更新角色 (管理员)
- `DELETE /api/roles/:id` - 删除角色 (管理员)

### 统计API
- `GET /api/stats/users` - 获取用户统计数据
- `GET /api/stats/overview` - 获取系统概览统计

### 日志API
- `GET /api/logs` - 获取日志列表
- `GET /api/logs/:id` - 获取单个日志

## 安全措施
- JWT身份验证
- 基于角色和权限的访问控制
- 请求速率限制
- 安全HTTP头
- XSS防护
- HTTP参数污染防护
- CORS配置

## 后续优化建议
1. 添加缓存机制提高性能
2. 实现数据备份和恢复功能
3. 添加更多的统计和可视化图表
4. 实现API文档自动生成
5. 添加单元测试和集成测试