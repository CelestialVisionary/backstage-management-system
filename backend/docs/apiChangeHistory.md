# API 变更历史

## 版本 1.0.0 (2023-10-20)

### 新增功能
- 初始版本发布
- 用户管理 API (注册、登录、查询、更新、删除)
- 角色管理 API (创建、查询、更新、删除)
- 权限控制机制
- 基础统计分析 API
- 活动日志记录 API

### 接口列表
- 用户注册: `POST /api/users/register`
- 用户登录: `POST /api/users/login`
- 获取用户列表: `GET /api/users`
- 获取单个用户: `GET /api/users/:id`
- 更新用户: `PUT /api/users/:id`
- 删除用户: `DELETE /api/users/:id`
- 创建角色: `POST /api/roles`
- 获取角色列表: `GET /api/roles`
- 获取单个角色: `GET /api/roles/:id`
- 更新角色: `PUT /api/roles/:id`
- 删除角色: `DELETE /api/roles/:id`

## 版本 1.1.0 (2023-11-15)

### 新增功能
- 添加密码重置功能
- 增加用户搜索和筛选功能
- 添加缓存机制提升性能
- 增加活动日志记录功能

### 接口变更
- 新增密码重置请求: `POST /api/users/forgotPassword`
- 新增密码重置: `PATCH /api/users/resetPassword/:token`
- 新增用户搜索: `GET /api/users/search`
- 新增个人资料更新: `PATCH /api/users/profile`

### 性能优化
- 为用户和角色列表添加缓存
- 为频繁访问的API添加缓存机制

## 版本 1.2.0 (计划中)

### 计划功能
- 添加部门管理功能
- 添加菜单管理功能
- 完善权限细粒度控制
- 增加数据字典功能