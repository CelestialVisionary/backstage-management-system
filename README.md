# 后台管理系统

## 项目简介
本项目是一个后台管理系统，包含前端和后端两部分，提供用户管理、角色管理、权限管理、数据统计、日志管理等核心功能，并支持数据备份与恢复、缓存机制等性能优化特性。

## 技术栈

### 前端
- 框架：React + TypeScript
- UI组件库：Ant Design
- 构建工具：Umi Max
- 其他依赖：@ant-design/pro-components、@ant-design/icons等

### 后端
- 运行环境：Node.js
- Web框架：Express
- 数据库：MongoDB（通过代码中MongoDB相关依赖推测）
- 认证：JWT
- 其他：支持缓存、数据备份等功能

## 功能模块

### 核心功能
1. **用户管理**：用户注册、登录、列表查询、详情查看、更新、删除等
2. **角色管理**：角色创建、列表查询、详情查看、更新、删除等
3. **权限管理**：基于角色分配权限，基于权限控制接口访问
4. **数据统计**：提供数据统计功能（具体统计内容可根据业务扩展）
5. **日志管理**：记录系统操作日志，支持日志查询

### 系统功能
1. **数据备份与恢复**：支持手动创建备份、恢复数据、查看备份列表、删除备份，自动清理旧备份
2. **缓存机制**：通过缓存中间中间件提高系统性能
3. **API权限控制**：基于角色和权限的接口访问控制

## 快速开始

### 环境要求
- Node.js (v14+)
- MongoDB (本地或远程实例)

### 后端启动
1. 进入后端目录
```bash
cd backstage-management-system/backend
```
2. 安装依赖
```bash
npm install
```
3. 配置环境变量（如JWT密钥、数据库连接等，可创建.env文件）
4. 启动服务
```bash
npm start
```
（默认启动在5000端口，可通过配置修改）

### 前端启动
1. 进入前端目录
```bash
cd backstage-management-system/frontend
```
2. 安装依赖
```bash
npm install
```
3. 启动开发服务器
```bash
npm run dev
```
4. 访问 http://localhost:8000（默认端口，可在配置中修改）

## 接口说明

### 用户相关
- POST /api/users/register - 用户注册
- POST /api/users/login - 用户登录
- GET /api/users - 获取用户列表（需管理员权限）
- GET /api/users/:id - 获取单个用户信息
- PUT /api/users/:id - 更新用户信息
- DELETE /api/users/:id - 删除用户（需管理员权限）

### 角色相关
- POST /api/roles - 创建角色
- GET /api/roles - 获取角色列表
- GET /api/roles/:id - 获取单个角色信息
- PUT /api/roles/:id - 更新角色信息
- DELETE /api/roles/:id - 删除角色

### 日志相关
- POST /api/logs - 创建日志
- GET /api/logs - 获取日志列表（需权限）
- GET /api/logs/:id - 获取单个日志（需权限）

### 备份相关
- POST /api/backups - 创建备份（需管理员权限）
- POST /api/backups/restore - 恢复备份（需管理员权限）
- GET /api/backups - 获取备份列表（需管理员权限）
- DELETE /api/backups - 删除备份（需管理员权限）

## 后续优化建议
1. 增强缓存策略，扩大缓存覆盖范围
2. 完善数据备份策略，支持定时自动备份
3. 增加更多数据统计维度和可视化图表
4. 实现API文档自动生成（如使用Swagger）
5. 完善单元测试和集成测试，提高代码覆盖率
6. 优化前端交互体验，增加更多实用功能组件

## 注意事项
- 生产环境需配置合适的JWT密钥和数据库连接信息
- 备份文件默认存储在`backstage_management/backups`目录，需确保该目录有读写权限
- 系统默认保留最近7个备份，可通过`backend/config/backupConfig.js`修改配置
