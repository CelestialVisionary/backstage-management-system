const swaggerJsDoc = require('swagger-jsdoc');

// Swagger 配置选项
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: '后台管理系统 API 文档',
      version: '1.2.0',
      description: '后台管理系统的 API 文档，包含用户管理、角色管理、权限管理、统计分析、活动日志等功能。提供完整的权限控制机制和用户管理功能。',
      contact: {
        name: '开发团队',
        email: 'team@example.com'
      },
      license: {
        name: 'MIT License',
        url: 'https://opensource.org/licenses/MIT'
      },
      servers: [
        {
          url: 'http://localhost:5000/api',
          description: '本地开发服务器'
        },
        {
          url: 'https://api.example.com/api',
          description: '生产服务器'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT认证令牌，用于访问受保护的API端点'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['username', 'email', 'password', 'role'],
          properties: {
            _id: {
              type: 'string',
              description: '用户ID',
              example: '60d21b4667d0d8992e610c85'
            },
            username: {
              type: 'string',
              description: '用户名',
              example: 'admin'
            },
            email: {
              type: 'string',
              format: 'email',
              description: '邮箱',
              example: 'admin@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: '密码',
              example: 'password123',
              writeOnly: true
            },
            role: {
              type: 'string',
              description: '角色ID',
              example: '60d21b4667d0d8992e610c86'
            },
            avatar: {
              type: 'string',
              description: '头像URL',
              example: 'https://example.com/avatar.jpg'
            },
            status: {
              type: 'string',
              enum: ['active', 'inactive', 'suspended'],
              description: '用户状态',
              example: 'active'
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
              description: '最后登录时间',
              example: '2023-10-20T12:30:45Z'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2023-10-01T10:15:30Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2023-10-20T12:30:45Z'
            }
          },
          example: {
            _id: '60d21b4667d0d8992e610c85',
            username: 'admin',
            email: 'admin@example.com',
            role: '60d21b4667d0d8992e610c86',
            avatar: 'https://example.com/avatar.jpg',
            status: 'active',
            lastLogin: '2023-10-20T12:30:45Z',
            createdAt: '2023-10-01T10:15:30Z',
            updatedAt: '2023-10-20T12:30:45Z'
          }
        },
        Role: {
          type: 'object',
          required: ['name', 'permissions'],
          properties: {
            _id: {
              type: 'string',
              description: '角色ID',
              example: '60d21b4667d0d8992e610c86'
            },
            name: {
              type: 'string',
              description: '角色名称',
              example: 'admin'
            },
            description: {
              type: 'string',
              description: '角色描述',
              example: '系统管理员，拥有所有权限'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: '权限列表',
              example: ['read:users', 'create:users', 'update:users', 'delete:users']
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间',
              example: '2023-10-01T10:15:30Z'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: '更新时间',
              example: '2023-10-20T12:30:45Z'
            }
          },
          example: {
            _id: '60d21b4667d0d8992e610c86',
            name: 'admin',
            description: '系统管理员，拥有所有权限',
            permissions: ['read:users', 'create:users', 'update:users', 'delete:users'],
            createdAt: '2023-10-01T10:15:30Z',
            updatedAt: '2023-10-20T12:30:45Z'
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: '用户邮箱',
              example: 'admin@example.com'
            },
            password: {
              type: 'string',
              format: 'password',
              description: '用户密码',
              example: 'password123'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: '用户ID',
              example: '60d21b4667d0d8992e610c85'
            },
            username: {
              type: 'string',
              description: '用户名',
              example: 'admin'
            },
            email: {
              type: 'string',
              format: 'email',
              description: '用户邮箱',
              example: 'admin@example.com'
            },
            role: {
              type: 'string',
              description: '角色ID',
              example: '60d21b4667d0d8992e610c86'
            },
            token: {
              type: 'string',
              description: 'JWT认证令牌',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js', './docs/apiChangeHistory.md'] // 扫描这些文件中的注释生成API文档
};

// 生成Swagger规范
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;