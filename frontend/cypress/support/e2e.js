// 导入commands
import './commands';

// 在每个测试前运行
beforeEach(() => {
  // 重置数据库或执行其他前置操作
  cy.request('POST', 'http://localhost:5000/api/test/reset');
});