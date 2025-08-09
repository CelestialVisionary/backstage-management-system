import { ProTable, ProDescriptions } from '@ant-design/pro-components';
import { queryUsers, deleteUser, searchUsers, batchDeleteUsers, batchAssignUserRoles, batchExportUsers, importUsers } from '@/services/user';
import { Button, message, Drawer, Form, Input, Select, Upload, Popconfirm, Modal, Space } from 'antd';
import { UploadOutlined, DownloadOutlined, UserDeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import { exportToExcel } from '@/utils/exportUtil';
import { PlusOutlined, DeleteOutlined, SearchOutlined, UserOutlined, MailOutlined, KeyOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useState, useRef } from 'react';
import { useIntl, formatMessage } from 'umi';

export default () => {
  const [form] = Form.useForm();
  const [editDrawerVisible, setEditDrawerVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [searchParams, setSearchParams] = useState<{ keyword?: string; role?: string }>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isRoleAssignModalOpen, setIsRoleAssignModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState<{ value: string; label: string }[]>([
    { value: 'admin', label: formatMessage({ id: 'user.role.admin' }) },
    { value: 'user', label: formatMessage({ id: 'user.role.user' }) },
    { value: 'editor', label: formatMessage({ id: 'user.role.editor' }) },
  ]);
  const intl = useIntl();

  // 搜索用户
  const handleSearch = () => {
    setSearchParams(form.getFieldsValue());
  };

  // 重置搜索
  const handleReset = () => {
    form.resetFields();
    setSearchParams({});
  };

  // 编辑用户
  const handleEdit = (record: any) => {
    setCurrentUser(record);
    form.setFieldsValue(record);
    setEditDrawerVisible(true);
  };

  // 关闭抽屉
  const handleCloseDrawer = () => {
    setEditDrawerVisible(false);
    setCurrentUser(null);
    form.resetFields();
  };

  // 保存用户编辑
  const handleSaveEdit = async () => {
    try {
      const values = await form.validateFields();
      // 调用更新用户API
      await updateUser({ id: currentUser.id }, values);
      message.success('用户更新成功');
      handleCloseDrawer();
      // 刷新表格
      tableRef.current?.reload();
    } catch (error) {
      message.error('保存失败，请检查表单');
    }
  };

  // 删除用户
  const handleDelete = async (id: any) => {
    try {
      await deleteUser({ id });
      message.success('用户删除成功');
      tableRef.current?.reload();
    } catch (error) {
      message.error('删除失败，请重试');
    }
  };

  // 批量删除用户
  const handleBatchDelete = async () => {
    try {
      if (selectedRowKeys.length === 0) {
        message.warning('请选择要删除的用户');
        return;
      }

      await batchDeleteUsers({ userIds: selectedRowKeys });
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      tableRef.current?.reload();
    } catch (error) {
      message.error('批量删除失败，请重试');
    }
  };

  // 打开角色分配模态框
  const handleOpenRoleAssignModal = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要分配角色的用户');
      return;
    }
    setIsRoleAssignModalOpen(true);
    setSelectedRole('');
  };

  // 关闭角色分配模态框
  const handleCloseRoleAssignModal = () => {
    setIsRoleAssignModalOpen(false);
  };

  // 提交角色分配
  const handleSubmitRoleAssign = async () => {
    try {
      if (!selectedRole) {
        message.warning('请选择角色');
        return;
      }

      await batchAssignUserRoles({ userIds: selectedRowKeys, roleName: selectedRole });
      message.success('批量分配角色成功');
      setIsRoleAssignModalOpen(false);
      tableRef.current?.reload();
    } catch (error) {
      message.error('批量分配角色失败，请重试');
    }
  };

  // 批量导出用户
  const handleBatchExport = async () => {
    try {
      const response = await batchExportUsers(searchParams);
      // 创建一个临时链接来下载文件
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success('导出成功');
    } catch (error) {
      message.error('导出失败，请重试');
    }
  };

  // 处理文件上传
  const handleFileUpload = async (file: any) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await importUsers(formData);
      message.success('导入成功');
      tableRef.current?.reload();
      return true;
    } catch (error) {
      message.error('导入失败，请重试');
      return false;
    }
  };

  // 表格引用
  const tableRef = useRef<ProTableInstance<any>>();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      sorter: true,
      filterable: true,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      filterable: true,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      sorter: true,
      filterable: true,
      valueEnum: {
        admin: { text: '管理员', status: 'Success' },
        user: { text: '普通用户', status: 'Default' },
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: true,
      valueType: 'dateTime',
    },
    {
      title: '操作',
      valueType: 'option',
      render: (_, record) => [
        <Button
          type="primary"
          key="edit"
          style={{ marginRight: 8 }}
          onClick={() => handleEdit(record)}
        >
          编辑
        </Button>,
        <Button
          type="danger"
          key="delete"
          icon={<DeleteOutlined />}
          onClick={() => {
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
    <PageContainer title="用户管理">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          type="primary"
          onClick={() => handleEdit({})}
          icon={<PlusOutlined />}
        >
          新建用户
        </Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Upload
            accept=".csv"
            beforeUpload={(file) => { handleFileUpload(file); return false; }}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>导入用户</Button>
          </Upload>
          <Button
            icon={<DownloadOutlined />}
            onClick={handleBatchExport}
          >
            导出用户
          </Button>
          <Button
            icon={<UserDeleteOutlined />}
            onClick={handleBatchDelete}
            disabled={selectedRowKeys.length === 0}
          >
            批量删除
          </Button>
          <Button
            icon={<KeyOutlined />}
            onClick={handleOpenRoleAssignModal}
            disabled={selectedRowKeys.length === 0}
          >
            分配角色
          </Button>
        </div>
      </div>
      {/* 搜索表单 */}
      <div style={{ marginBottom: 16, padding: 16, backgroundColor: '#f5f5f5', borderRadius: 8 }}>
        <Form form={form} layout="inline" initialValues={searchParams}>
          <Form.Item name="keyword" label="关键词">
            <Input placeholder="用户名或邮箱" prefix={<SearchOutlined />} />
          </Form.Item>
          <Form.Item name="role" label="角色">
            <Select placeholder="选择角色" options={roles} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSearch}>搜索</Button>
          </Form.Item>
          <Form.Item>
            <Button onClick={handleReset}>重置</Button>
          </Form.Item>
        </Form>
      </div>

      {/* 用户表格 */}
      <ProTable
        columns={columns}
        request={(params) => searchUsers({ ...params, ...searchParams })}
        rowKey="id"
        ref={tableRef}
        pagination={{ pageSize: 10 }}
        loading={false}
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
          selections: [
            {
              key: 'all-data',
              text: '全选',
              onSelect: () => tableRef.current?.selectAll(),
            },
            {
              key: 'clear',
              text: '取消选择',
              onSelect: () => setSelectedRowKeys([]),
            },
          ],
        }}
        toolBarRender={() => (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button icon={<SearchOutlined />} onClick={() => tableRef.current?.reload()}>刷新</Button>
            <div>{selectedRowKeys.length > 0 && `已选择 ${selectedRowKeys.length} 项`}</div>
          </div>
        )}
        expandable={{ expandedRowRender: (record) => (
          <ProDescriptions column={2} title="用户详情" dataSource={record} />
        )}}
      />

      {/* 编辑用户抽屉 */}
      <Drawer
        title="编辑用户"
        width={500}
        onClose={handleCloseDrawer}
        visible={editDrawerVisible}
      >
        <Form form={form} initialValues={currentUser} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, message: '请输入邮箱' }]}>
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select options={roles} placeholder="选择角色" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ min: 6, message: '密码长度不能少于6个字符' }]}>
            <Input prefix={<KeyOutlined />} placeholder="不修改密码请留空" type="password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSaveEdit} block>保存</Button>
          </Form.Item>
        </Form>
      </Drawer>

    {/* 角色分配模态框 */}
    <Modal
      title="批量分配角色"
      open={isRoleAssignModalOpen}
      onCancel={handleCloseRoleAssignModal}
      onOk={handleSubmitRoleAssign}
    >
      <Form layout="vertical">
        <Form.Item label="选择角色">
          <Select
            value={selectedRole}
            onChange={(value) => setSelectedRole(value)}
            options={roles}
            placeholder="请选择角色"
            style={{ width: '100%' }}
          />
        </Form.Item>
        <p style={{ color: '#666', marginTop: 16 }}>将为 {selectedRowKeys.length} 个选中的用户分配角色</p>
      </Form>
    </Modal>
  </PageContainer>
);
};