import { ProTable } from '@ant-design/pro-components';
import { queryUsers, deleteUser } from '@/services/user';
import { Button, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';

export default () => {
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          type="primary"
          key="edit"
          style={{ marginRight: 8 }}
          onClick={() => {
            // 编辑用户逻辑
            message.info(`编辑用户: ${record.username}`);
          }}
        >
          编辑
        </Button>,
        <Button
          type="danger"
          key="delete"
          icon={<DeleteOutlined />}
          onClick={() => {
            // 删除用户逻辑
            deleteUser({ id: record.id }).then(() => {
              message.success('删除成功');
            });
          }}
        >
          删除
        </Button>
      ],
    },
  ];

  return (
    <PageContainer
      title="用户管理"
      extra={[
        <Button
          type="primary"
          key="add"
          icon={<PlusOutlined />}
          onClick={() => {
            // 添加用户逻辑
            message.info('添加用户');
          }}
        >
          添加用户
        </Button>
      ]}
    >
      <ProTable
        columns={columns}
        request={queryUsers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </PageContainer>
  );
};