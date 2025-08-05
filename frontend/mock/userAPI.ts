const users = [
  { id: '1', username: 'admin', email: 'admin@example.com', role: '管理员', createdAt: '2023-01-01 10:00:00' },
  { id: '2', username: 'user1', email: 'user1@example.com', role: '普通用户', createdAt: '2023-01-02 10:00:00' },
  { id: '3', username: 'user2', email: 'user2@example.com', role: '普通用户', createdAt: '2023-01-03 10:00:00' },
  { id: '4', username: 'user3', email: 'user3@example.com', role: '普通用户', createdAt: '2023-01-04 10:00:00' },
  { id: '5', username: 'user4', email: 'user4@example.com', role: '普通用户', createdAt: '2023-01-05 10:00:00' },
];

export default {
  'GET /api/v1/queryUserList': (req: any, res: any) => {
    const { current = 1, pageSize = 10, keyword = '' } = req.query;
    const filteredUsers = keyword
      ? users.filter(user => user.username.includes(keyword) || user.email.includes(keyword))
      : users;
    const startIndex = (current - 1) * pageSize;
    const endIndex = startIndex + Number(pageSize);
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        records: paginatedUsers,
        total: filteredUsers.length,
      },
      errorCode: 0,
    });
  },
  'DELETE /api/v1/user/:userId': (req: any, res: any) => {
    const { userId } = req.params;
    const index = users.findIndex(user => user.id === userId);
    if (index !== -1) {
      users.splice(index, 1);
      res.json({
        success: true,
        data: '删除成功',
        errorCode: 0,
      });
    } else {
      res.json({
        success: false,
        errorMessage: '用户不存在',
        errorCode: 1,
      });
    }
  },
  'PUT /api/v1/user/:userId': (req: any, res: any) => {
    const { userId } = req.params;
    const { username, email, role } = req.body;
    const user = users.find(user => user.id === userId);
    if (user) {
      user.username = username;
      user.email = email;
      user.role = role;
      res.json({
        success: true,
        data: user,
        errorCode: 0,
      });
    } else {
      res.json({
        success: false,
        errorMessage: '用户不存在',
        errorCode: 1,
      });
    }
  },
  'POST /api/v1/user': (req: any, res: any) => {
    const { username, email, role } = req.body;
    const newUser = {
      id: String(users.length + 1),
      username,
      email,
      role,
      createdAt: new Date().toLocaleString(),
    };
    users.push(newUser);
    res.json({
      success: true,
      data: newUser,
      errorCode: 0,
    });
  },
};
