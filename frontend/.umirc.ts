import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {},
  layout: {
    title: '@umijs/max',
  },
  proxy: {
    '/api': {
      'target': 'http://localhost:5000',
      'changeOrigin': true,
    },
  },
  routes: [
    {
      path: '/',
      component: './index',
      routes: [
        {
          path: '/',
          redirect: '/home',
        },
        {
          name: '首页',
          path: '/home',
          component: './Home',
          icon: 'home',
        },
        {
          name: '权限演示',
          path: '/access',
          component: './Access',
          icon: 'key',
        },
        {
          name: 'CRUD 示例',
          path: '/table',
          component: './Table',
          icon: 'table',
        },
        {
          name: '用户管理',
          path: '/users',
          component: './Users',
          icon: 'user',
        },
        {
          name: '数据可视化',
          path: '/dashboard',
          component: './Dashboard',
          icon: 'dashboard',
        }
      ]
    }
  ],
  locale: {
    default: 'zh-CN',
    antd: true,
    baseNavigator: true,
  },
  lessLoader: {
    modifyVars: {
      '@border-radius-base': '8px',
    },
  },
  npmClient: 'npm',
});

