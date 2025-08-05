const swaggerJsDoc = require('swagger-jsdoc');

// Swagger 配置选项
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: '后台管理系统 API 文档',
      version: '1.0.0',
      description: '后台管理系统的 API 文档，包含用户管理、角色管理、权限管理、统计分析等功能',
      contact: {
        name: '开发团队',
        email: 'team@example.com'
      },
      servers: [
        {
          url: 'http://localhost:5000/api',
          description: '本地开发服务器'
        }
      ]
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: '用户ID'
            },
            name: {
              type: 'string',
              description: '用户名'
            },
            email: {
              type: 'string',
              description: '邮箱'
            },
            role: {
              type: 'string',
              description: '角色ID'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '创建时间'
            }
          }
        },
        Role: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: '角色ID'
            },
            name: {
              type: 'string',
              description: '角色名称'
            },
            permissions: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: '权限列表'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js'] // 扫描这些文件中的注释生成API文档
};

// 生成Swagger规范
const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;