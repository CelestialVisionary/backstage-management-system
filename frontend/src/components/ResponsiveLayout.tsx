// src/components/ResponsiveLayout.tsx
import { Layout, Menu, Button, Dropdown, Space } from 'antd';
import { useIntl, formatMessage } from 'umi';
import { SunOutlined, MoonOutlined, MenuOutlined, XOutlined, GlobeOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { Header, Content, Footer, Sider } = Layout;

export default function ResponsiveLayout({ children }) {
  const intl = useIntl();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('zh-CN');
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // 切换语言
  const changeLanguage = (lang) => {
    setCurrentLang(lang);
    window.g_app._store.dispatch({
      type: 'intl/changeLocale',
      payload: lang,
    });
  };

  // 语言菜单
  const languageMenu = (
    <Menu>
      <Menu.Item key='zh-CN' onClick={() => changeLanguage('zh-CN')}>中文</Menu.Item>
      <Menu.Item key='en-US' onClick={() => changeLanguage('en-US')}>English</Menu.Item>
    </Menu>
  );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 移动端菜单按钮 */}
      <Button
        className='mobile-menu-button'
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        style={{
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: 500,
          display: { xs: 'block', sm: 'none' }['xs'],
        }}
      >
        {isMobileMenuOpen ? <XOutlined /> : <MenuOutlined />}
      </Button>

      {/* 侧边栏 */}
      <Sider
        width={200}
        breakpoint='sm'
        collapsedWidth={0}
        onBreakpoint={(broken) => {}}
        onCollapse={(collapsed, type) => {}}
        style={{
          position: 'fixed',
          height: '100vh',
          zIndex: 400,
        }}
      >
        <div className='logo' style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
        <Menu
          theme='dark'
          mode='inline'
          defaultSelectedKeys={['1']}
          items={[
            {
              key: '1',
              icon: <HomeOutlined />,
              label: formatMessage({ id: 'menu.home' }),
              path: '/home',
            },
            {
              key: '2',
              icon: <KeyOutlined />,
              label: formatMessage({ id: 'menu.access' }),
              path: '/access',
            },
            {
              key: '3',
              icon: <TableOutlined />,
              label: formatMessage({ id: 'menu.table' }),
              path: '/table',
            },
            {
              key: '4',
              icon: <UserOutlined />,
              label: formatMessage({ id: 'menu.users' }),
              path: '/users',
            },
            {
              key: '5',
              icon: <DashboardOutlined />,
              label: formatMessage({ id: 'menu.dashboard' }),
              path: '/dashboard',
            },
          ]}
          onClick={(item) => {
            window.location.href = item.path;
            if (isMobileMenuOpen) setIsMobileMenuOpen(false);
          }}
        />
      </Sider>

      {/* 主内容区 */}
      <Layout className='site-layout' style={{ marginLeft: 200 }}>
        <Header
          className='site-layout-background'
          style={{ padding: 0, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', paddingRight: 24 }}
        >
          <Space size='middle'>
            {/* 语言切换 */}
            <Dropdown overlay={languageMenu} placement='bottomRight'>
              <Button icon={<GlobeOutlined />}>{currentLang === 'zh-CN' ? '中文' : 'English'}</Button>
            </Dropdown>

            {/* 主题切换 */}
            <Button
              icon={isDarkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => window.toggleDarkMode?.()}
            >
              {isDarkMode ? formatMessage({ id: 'theme.light' }) : formatMessage({ id: 'theme.dark' })}
            </Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280 }}>
          {children}
        </Content>
        <Footer style={{ textAlign: 'center' }}>Ant Design ©{new Date().getFullYear()} Created by UmiJS</Footer>
      </Layout>
    </Layout>
  );
}

// 导入缺失的图标
import { HomeOutlined, KeyOutlined, TableOutlined, UserOutlined, DashboardOutlined } from '@ant-design/icons';