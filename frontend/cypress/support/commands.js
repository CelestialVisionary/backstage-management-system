// 登录命令
Cypress.Commands.add('login', (email, password) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/users/login',
    body: {
      email,
      password
    }
  }).then((response) => {
    expect(response.status).to.eq(200);
    localStorage.setItem('token', response.body.token);
  });
});

// 登出命令
Cypress.Commands.add('logout', () => {
  localStorage.removeItem('token');
});

// 创建用户命令
Cypress.Commands.add('createUser', (userData) => {
  cy.request({
    method: 'POST',
    url: 'http://localhost:5000/api/users/register',
    body: userData
  });
});