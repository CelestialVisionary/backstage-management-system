describe('Login Page', () => {
  beforeEach(() => {
    // 访问登录页面
    cy.visit('/login');
  });

  it('应该显示登录表单', () => {
    cy.get('input[name="email"]').should('exist');
    cy.get('input[name="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('使用有效凭据登录', () => {
    // 创建测试用户
    const testUser = {
      username: 'testuser',
      email: 'test@example.com',
      password: Cypress.env('TEST_USER_PASSWORD') || 'password123'
    };

    cy.createUser(testUser);

    // 填写登录表单
    cy.get('input[name="email"]').type(testUser.email);
    cy.get('input[name="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();

    // 验证登录成功
    cy.url().should('include', '/dashboard');
    cy.contains('欢迎回来').should('exist');
  });

  it('使用无效凭据登录应该失败', () => {
    // 填写错误的登录信息
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('invalidpassword');
    cy.get('button[type="submit"]').click();

    // 验证登录失败
    cy.contains('邮箱或密码不正确').should('exist');
  });
});