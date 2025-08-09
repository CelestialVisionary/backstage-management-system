# 后台管理系统 - 前端

## 项目架构

![项目架构图](../backend/docs/architecture.svg)

## 技术栈
- Umi Max
- Ant Design
- TypeScript
- React
- Redux (Umi内置)
- Axios
- ECharts (数据可视化)

## 功能模块
1. 登录与认证
2. 仪表盘/首页
3. 用户管理
4. 角色管理
5. 权限管理
6. 数据统计与可视化
7. 日志管理
8. 系统设置

## 环境设置

### 1. 安装依赖
```bash
cd frontend
npm install
```

### 2. 配置环境变量
创建`.env`文件，添加以下环境变量：
```
PORT=8000
API_BASE_URL=http://localhost:5000/api
```

### 3. 启动开发服务器
```bash
npm run dev
```

### 4. 构建生产环境
```bash
npm run build
```

## 项目结构
```
frontend/
├── config/                 # 配置文件
│   ├── config.ts           # Umi配置
│   └── routes.ts           # 路由配置
├── src/
│   ├── access.ts           # 权限定义
│   ├── app.tsx             # 运行时配置
│   ├── components/         # 公共组件
│   ├── e2e/                # 端到端测试
│   ├── locales/            # 国际化资源
│   ├── models/             # 全局数据模型
│   ├── pages/              # 页面组件
│   ├── services/           # API服务
│   └── utils/              # 工具函数
├── .env                    # 环境变量
├── .eslintrc.js            # ESLint配置
├── .prettierrc.js          # Prettier配置
├── package.json            # 依赖配置
└── README.md               # 项目说明
```

## 代码规范
- 使用TypeScript编写
- 遵循Airbnb JavaScript Style Guide
- 使用Prettier进行代码格式化
- 使用ESLint进行代码检查
- 组件命名采用帕斯卡命名法(PascalCase)
- 函数和变量命名采用驼峰命名法(camelCase)

## API请求
使用Umi提供的request方法进行API请求，已封装在src/services目录下：
```typescript
// src/services/user.ts
import { request } from 'umi';

export async function queryUsers(params) {
  return request('/api/users', {
    method: 'GET',
    params,
  });
}
```

## 权限控制
使用Umi的access插件进行权限控制：
```typescript
// src/access.ts
export default function(initialState) {
  const { currentUser } = initialState || {};
  return {
    canAdmin: currentUser && currentUser.access === 'admin',
    canUser: currentUser && currentUser.access === 'user',
  };
}
```

## 部署指南

### 生产环境部署
1. 构建生产包：`npm run build`
2. 将dist目录下的文件部署到Nginx或其他静态文件服务器
3. 配置Nginx反向代理到后端API服务

### Nginx配置示例
```nginx
server {
  listen 80;
  server_name yourdomain.com;

  location / {
    root /path/to/frontend/dist;
    index index.html;
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

## 开发贡献指南

### 开发环境设置
```bash
# 克隆代码
git clone https://github.com/yourusername/backstage-management-system.git
cd backstage-management-system/frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，设置开发环境变量
vi .env

# 启动开发服务器
npm run dev
```

### 提交规范
- 提交信息格式：`类型(范围): 描述`
  - 类型: feat(新功能), fix(修复bug), docs(文档), style(格式), refactor(重构), test(测试), chore(构建)
  - 范围: 可选，指修改的模块或功能
  - 描述: 简洁明了的修改说明
- 示例: `feat(dashboard): 添加用户统计图表`

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

## 联系我们
如有问题或建议，请联系我们: backstage-management@example.com
