// 运行时配置

// 全局初始化数据配置
export async function getInitialState() {
  return { name: '@umijs/max' };
}

export const layout = () => {
  return {
    logo: 'https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg',
    menu: {
      locale: true,
    },
  };
};

// 覆盖ConfigProvider
export function rootContainer(container) {
  return container;
}
