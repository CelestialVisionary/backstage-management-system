# 后台管理系统 - 后端API

# 后台管理系统 - 后端

## 项目架构

![项目架构图](docs/architecture.svg)

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

## 部署指南

### 环境要求
- Node.js 14.x 或更高版本
- MongoDB 4.x 或更高版本
- npm 6.x 或更高版本

### 生产环境部署步骤

#### 1. 准备服务器
- 选择合适的云服务器或本地服务器
- 安装Node.js和MongoDB
- 配置服务器防火墙，开放必要端口(如5000)

#### 2. 代码部署
```bash
# 克隆代码
git clone https://github.com/yourusername/backstage-management-system.git
cd backstage-management-system/backend

# 安装依赖
npm install --production

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置正确的环境变量
vi .env
```

#### 3. 初始化数据
```bash
# 初始化角色
node initRoles.js
```

#### 4. 启动服务
```bash
# 使用PM2进行进程管理
npm install -g pm2
pm run build
pm run start:prod
```

### 容器化部署 (Docker)

#### 1. 构建Docker镜像
```bash
docker build -t backstage-backend .
```

#### 2. 运行容器
```bash
docker run -d -p 5000:5000 --name backstage-backend-container backstage-backend
```

### 常见问题
- MongoDB连接问题：检查MONGODB_URI是否正确，确保MongoDB服务正常运行
- 端口冲突：修改.env文件中的PORT配置
- 权限问题：确保应用有足够权限访问所需文件和目录

## 开发贡献指南

### 开发环境设置
```bash
# 克隆代码
git clone https://github.com/yourusername/backstage-management-system.git
cd backstage-management-system/backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置开发环境变量
vi .env

# 启动开发服务器
npm run dev
```

### 代码规范
- 使用ES6+语法
- 遵循Airbnb JavaScript Style Guide
- 使用Prettier进行代码格式化
- 使用ESLint进行代码检查

### 提交规范
- 提交信息格式：`类型(范围): 描述`
  - 类型: feat(新功能), fix(修复bug), docs(文档), style(格式), refactor(重构), test(测试), chore(构建)
  - 范围: 可选，指修改的模块或功能
  - 描述: 简洁明了的修改说明
- 示例: `feat(user): 添加用户注册功能`

### 分支策略
- main: 主分支，用于生产环境
- develop: 开发分支，用于集成测试
- feature/xxx: 功能分支，用于开发新功能
- bugfix/xxx: 修复分支，用于修复bug

### 贡献流程
1. Fork本仓库
2. 创建功能分支: `git checkout -b feature/your-feature`
3. 提交修改: `git commit -m 'feat(scope): 描述'`
4. 推送到远程: `git push origin feature/your-feature`
5. 创建Pull Request
6. 代码审核通过后合并到develop分支

### 测试要求
- 新增功能必须添加单元测试
- 修复bug必须添加相应的测试用例
- 确保所有测试通过后再提交Pull Request

## 文档资源

1. [用户手册](docs/userManual.md) - 详细介绍系统功能和使用方法
2. [常见问题解答](docs/faq.md) - 解答使用过程中可能遇到的问题
3. [功能操作视频教程](docs/videoTutorials.md) - 提供视频教程的概述和访问方式

## 联系我们
如有问题或建议，请联系我们: backstage-management@example.com