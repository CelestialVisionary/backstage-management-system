import { request } from '@umijs/max';

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