import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Divider } from 'antd';
import { useIntl, formatMessage } from 'umi';
import { SunOutlined, MoonOutlined, GlobeOutlined, LayoutOutlined } from '@ant-design/icons';

export default function HomePage() {
  const intl = useIntl();
  const [darkMode, setDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState('zh-CN');

  // 检测当前主题模式
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(isDark);

    // 监听主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setDarkMode(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 检测当前语言
  useEffect(() => {
    const lang = window.g_app?._store?.getState()?.intl?.locale || 'zh-CN';
    setCurrentLang(lang);

    // 监听语言变化
    const unsubscribe = window.g_app?._store?.subscribe(() => {
      const newLang = window.g_app?._store?.getState()?.intl?.locale || 'zh-CN';
      if (newLang !== currentLang) {
        setCurrentLang(newLang);
      }
    });

    return () => unsubscribe?.();
  }, [currentLang]);

  return (
    <Space direction='vertical' size='middle' style={{ width: '100%' }}>
      <Card title={formatMessage({ id: 'menu.home' })}>
        <Typography.Title level={2} style={{ textAlign: 'center' }}>
          {formatMessage({ id: 'menu.home' })} - {formatMessage({ id: 'theme.switch' })} & {formatMessage({ id: 'menu.access' })}
        </Typography.Title>

        <Divider />

        <Space direction='vertical' size='large'>
          {/* 主题演示 */}
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: darkMode ? '#2c2c2c' : '#f0f0f0' }}>
            <Typography.Title level={4} style={{ color: darkMode ? '#ffffff' : '#333333' }}>
              <Space align='center'>
                {darkMode ? <MoonOutlined /> : <SunOutlined />}
                {formatMessage({ id: darkMode ? 'theme.dark' : 'theme.light' })} ({darkMode ? 'Dark' : 'Light'})
              </Space>
            </Typography.Title>
            <Typography.Paragraph style={{ color: darkMode ? '#aaaaaa' : '#666666' }}>
              {formatMessage({ id: 'theme.switch' })} demonstration. This card's background and text color change based on the selected theme.
            </Typography.Paragraph>
            <Button
              icon={darkMode ? <SunOutlined /> : <MoonOutlined />}
              onClick={() => window.toggleDarkMode?.()}
            >
              {formatMessage({ id: darkMode ? 'theme.light' : 'theme.dark' })}
            </Button>
          </div>

          {/* 语言演示 */}
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: darkMode ? '#2c2c2c' : '#f0f0f0' }}>
            <Typography.Title level={4} style={{ color: darkMode ? '#ffffff' : '#333333' }}>
              <Space align='center'>
                <GlobeOutlined />
                {formatMessage({ id: 'menu.access' })} ({currentLang})
              </Space>
            </Typography.Title>
            <Typography.Paragraph style={{ color: darkMode ? '#aaaaaa' : '#666666' }}>
              {formatMessage({ id: 'menu.access' })} demonstration. This text is displayed in the selected language.
            </Typography.Paragraph>
            <Button
              icon={<GlobeOutlined />}
              onClick={() => {
                const newLang = currentLang === 'zh-CN' ? 'en-US' : 'zh-CN';
                window.g_app._store.dispatch({
                  type: 'intl/changeLocale',
                  payload: newLang,
                });
              }}
            >
              {currentLang === 'zh-CN' ? 'English' : '中文'}
            </Button>
          </div>

          {/* 响应式布局演示 */}
          <div style={{ padding: 16, borderRadius: 8, backgroundColor: darkMode ? '#2c2c2c' : '#f0f0f0' }}>
            <Typography.Title level={4} style={{ color: darkMode ? '#ffffff' : '#333333' }}>
              <Space align='center'>
                <LayoutOutlined />
                {formatMessage({ id: 'menu.table' })} Demo
              </Space>
            </Typography.Title>
            <Typography.Paragraph style={{ color: darkMode ? '#aaaaaa' : '#666666' }}>
              {formatMessage({ id: 'menu.table' })} demonstration. This layout adapts to different screen sizes.
              Try resizing your browser window to see the responsive behavior.
            </Typography.Paragraph>
            <Button
              type='primary'
              onClick={() => window.location.href = '/users'}
            >
              {formatMessage({ id: 'menu.users' })}
            </Button>
          </div>
        </Space>
      </Card>
    </Space>
  );
}
