import { request } from '@umijs/max';

/**
 * 批量删除用户
 * @param params 用户ID列表
 * @returns 删除结果
 */
export async function batchDeleteUsers(params: {
  userIds: React.Key[];
}) {
  return request('/api/users/batch-delete', {
    method: 'DELETE',
    data: params,
  });
}

/**
 * 批量分配用户角色
 * @param params 用户ID列表和角色
 * @returns 分配结果
 */
export async function batchAssignUserRoles(params: {
  userIds: React.Key[];
  role: string;
}) {
  return request('/api/users/batch-assign-roles', {
    method: 'POST',
    data: params,
  });
}

/**
 * 批量导出用户
 * @param params 导出参数
 * @returns 导出结果
 */
export async function batchExportUsers(params: {
  userIds?: React.Key[];
  keyword?: string;
  role?: string;
}) {
  return request('/api/users/export', {
    method: 'GET',
    params,
    responseType: 'blob',
  });
}

/**
 * 导入用户
 * @param data 导入数据
 * @returns 导入结果
 */
export async function importUsers(data: FormData) {
  return request('/api/users/import', {
    method: 'POST',
    data,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

/**
 * 查询用户列表
 * @param params 查询参数
 * @returns 用户列表
 */
export async function queryUsers(params: {
  keyword?: string;
  current?: number;
  pageSize?: number;
}) {
  return request('/api/users', {
    method: 'GET',
    params,
  });
}

/**
 * 删除用户
 * @param params 用户ID
 * @returns 删除结果
 */
export async function deleteUser(params: {
  id: string;
}) {
  return request(`/api/users/${params.id}`, {
    method: 'DELETE',
  });
}

/**
 * 添加用户
 * @param data 用户数据
 * @returns 添加结果
 */
export async function createUser(data: any) {
  return request('/api/users/register', {
    method: 'POST',
    data,
  });
}

/**
 * 更新用户
 * @param params 用户ID
 * @param data 用户数据
 * @returns 更新结果
 */
export async function updateUser(params: {
  id: string;
}, data: any) {
  return request(`/api/users/${params.id}`, {
    method: 'PUT',
    data,
  });
}

/**
 * 获取用户详情
 * @param params 用户ID
 * @returns 用户详情
 */
export async function getUserInfo(params: {
  id: string;
}) {
  return request(`/api/users/${params.id}`, {
    method: 'GET',
  });
}

/**
 * 搜索用户
 * @param params 搜索参数
 * @returns 搜索结果
 */
export async function searchUsers(params: {
  keyword?: string;
  role?: string;
  current?: number;
  pageSize?: number;
}) {
  return request('/api/users/search', {
    method: 'GET',
    params,
  });
}