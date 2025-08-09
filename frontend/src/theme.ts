// src/theme.ts
import { ThemeConfig } from '@ant-design/cssinjs';
import { useMediaQuery } from 'react';

// 亮色主题
const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    colorBgBase: '#ffffff',
    colorTextBase: '#333333',
    colorTextSecondary: '#666666',
    borderRadius: 8,
  },
  components: {
    Button: {
      borderRadius: 4,
    },
  },
};

// 暗色主题
const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: '#40a9ff',
    colorBgBase: '#141414',
    colorTextBase: '#ffffff',
    colorTextSecondary: '#aaaaaa',
    borderRadius: 8,
  },
  components: {
    Button: {
      borderRadius: 4,
    },
  },
};

// 主题切换钩子
export function useTheme() {
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return isDarkMode ? darkTheme : lightTheme;
}

// 导出主题配置
export { lightTheme, darkTheme };