# API 使用示例

## 认证示例

### 登录获取令牌

```bash
# 请求
POST /api/users/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

# 响应
HTTP/1.1 200 OK
Content-Type: application/json

{
  "_id": "60d21b4667d0d8992e610c85",
  "username": "admin",
  "email": "admin@example.com",
  "role": "60d21b4667d0d8992e610c86",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 使用令牌访问受保护的API

```bash
# 请求
GET /api/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 响应
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "admin",
    "email": "admin@example.com",
    "role": "60d21b4667d0d8992e610c86",
    "status": "active",
    "createdAt": "2023-10-01T10:15:30Z"
  },
  ...
]
```

## 用户管理 API 示例

### 注册新用户

```bash
# 请求
POST /api/users/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "new@example.com",
  "password": "newpassword123",
  "role": "60d21b4667d0d8992e610c87"
}

# 响应
HTTP/1.1 201 Created
Content-Type: application/json

{
  "_id": "60d21b4667d0d8992e610c88",
  "username": "newuser",
  "email": "new@example.com",
  "role": "60d21b4667d0d8992e610c87",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 获取单个用户

```bash
# 请求
GET /api/users/60d21b4667d0d8992e610c85
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 响应
HTTP/1.1 200 OK
Content-Type: application/json

{
  "_id": "60d21b4667d0d8992e610c85",
  "username": "admin",
  "email": "admin@example.com",
  "role": {
    "_id": "60d21b4667d0d8992e610c86",
    "name": "admin",
    "permissions": ["read:users", "create:users", "update:users", "delete:users"]
  },
  "status": "active",
  "lastLogin": "2023-10-20T12:30:45Z",
  "createdAt": "2023-10-01T10:15:30Z",
  "updatedAt": "2023-10-20T12:30:45Z"
}
```

### 更新用户

```bash
# 请求
PUT /api/users/60d21b4667d0d8992e610c85
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "username": "updatedadmin",
  "email": "updatedadmin@example.com",
  "status": "active"
}

# 响应
HTTP/1.1 200 OK
Content-Type: application/json

{
  "_id": "60d21b4667d0d8992e610c85",
  "username": "updatedadmin",
  "email": "updatedadmin@example.com",
  "role": "60d21b4667d0d8992e610c86",
  "status": "active",
  "updatedAt": "2023-10-21T09:15:30Z"
}
```

### 删除用户

```bash
# 请求
DELETE /api/users/60d21b4667d0d8992e610c88
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 响应
HTTP/1.1 200 OK
Content-Type: application/json

{
  "message": "用户已删除"
}
```

## 角色管理 API 示例

### 创建新角色

```bash
# 请求
POST /api/roles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "editor",
  "description": "内容编辑者",
  "permissions": ["read:users", "update:users", "read:roles"]
}

# 响应
HTTP/1.1 201 Created
Content-Type: application/json

{
  "_id": "60d21b4667d0d8992e610c89",
  "name": "editor",
  "description": "内容编辑者",
  "permissions": ["read:users", "update:users", "read:roles"],
  "createdAt": "2023-10-21T10:15:30Z"
}
```

### 获取角色列表

```bash
# 请求
GET /api/roles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 响应
HTTP/1.1 200 OK
Content-Type: application/json

[
  {
    "_id": "60d21b4667d0d8992e610c86",
    "name": "admin",
    "description": "系统管理员",
    "permissions": ["read:users", "create:users", "update:users", "delete:users", "read:roles", "create:roles", "update:roles", "delete:roles"]
  },
  {
    "_id": "60d21b4667d0d8992e610c89",
    "name": "editor",
    "description": "内容编辑者",
    "permissions": ["read:users", "update:users", "read:roles"]
  }
]
```

## 错误处理示例

```bash
# 请求 (无效的令牌)
GET /api/users
Authorization: Bearer invalid_token

# 响应
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "message": "无效的令牌"
}

# 请求 (不存在的资源)
GET /api/users/non_existent_id
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 响应
HTTP/1.1 404 Not Found
Content-Type: application/json

{
  "message": "用户未找到"
}

# 请求 (验证错误)
POST /api/users/register
Content-Type: application/json

{
  "username": "newuser",
  "email": "invalid-email",
  "password": "short"
}

# 响应
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "message": "验证失败",
  "errors": {
    "email": "无效的邮箱格式",
    "password": "密码长度至少为6个字符"
  }
}
```

## JavaScript 客户端示例

```javascript
// 登录获取令牌
async function login() {
  try {
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'admin123'
      })
    });
    const data = await response.json();
    if (response.ok) {
      localStorage.setItem('token', data.token);
      return data;
    } else {
      throw new Error(data.message || '登录失败');
    }
  } catch (error) {
    console.error('登录错误:', error);
    throw error;
  }
}

// 获取用户列表
async function getUsers() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('未登录');
    }
    const response = await fetch('/api/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || '获取用户列表失败');
    }
  } catch (error) {
    console.error('获取用户列表错误:', error);
    throw error;
  }
}
```