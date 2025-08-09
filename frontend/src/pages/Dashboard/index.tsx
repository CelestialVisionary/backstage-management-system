import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, message } from 'antd';
import { BarChart, LineChart, PieChart } from '@/components/Charts';
import { ExportOutlined, RefreshOutlined, SettingsOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import styles from './index.less';

// 模拟数据
const generateMockData = () => {
  // 柱状图数据
  const barData = {
    xAxis: ['一月', '二月', '三月', '四月', '五月', '六月'],
    series: [
      {
        name: '销售额',
        data: [1200, 1900, 3000, 2400, 2700, 3800],
      },
      {
        name: '利润',
        data: [500, 800, 1200, 1000, 1300, 1800],
      },
    ],
  };

  // 折线图数据
  const lineData = {
    xAxis: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
    series: [
      {
        name: '访问量',
        data: [1500, 2300, 2000, 2700, 3000, 4500, 5000],
        smooth: true,
      },
      {
        name: '注册量',
        data: [300, 500, 450, 700, 800, 1200, 1500],
        smooth: true,
      },
    ],
  };

  // 饼图数据
  const pieData = [
    {
      name: '用户来源-直接访问',
      value: 35,
    },
    {
      name: '用户来源-搜索引擎',
      value: 45,
    },
    {
      name: '用户来源-社交媒体',
      value: 15,
    },
    {
      name: '用户来源-广告推广',
      value: 5,
    },
  ];

  return {
    barData,
    lineData,
    pieData,
  };
};

const Dashboard: React.FC = () => {
  const [chartData, setChartData] = useState(generateMockData());
  const [loading, setLoading] = useState(false);

  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    // 模拟数据加载延迟
    setTimeout(() => {
      setChartData(generateMockData());
      setLoading(false);
      message.success('数据已刷新');
    }, 1000);
  };

  // 导出所有数据
  const handleExportAll = () => {
    // 这里只是模拟导出功能
    message.success('所有图表数据已导出');
    // 实际应用中，可以添加真实的导出逻辑
  };

  return (
    <PageContainer title="数据可视化仪表盘">
      <div className={styles.dashboardContainer}>
        {/* 工具栏 */}
        <div className={styles.toolbar}>
          <Button
            icon={<RefreshOutlined />}
            onClick={handleRefresh}
            loading={loading}
          >
            刷新数据
          </Button>
          <Button
            icon={<ExportOutlined />}
            onClick={handleExportAll}
            style={{ marginLeft: 10 }}
          >
            导出所有数据
          </Button>
          <Button
            icon={<SettingsOutlined />}
            style={{ marginLeft: 10 }}
            type="dashed"
          >
            仪表盘设置
          </Button>
        </div>

        {/* 图表区域 */}
        <Row gutter={[16, 16]} className={styles.chartsRow}>
          <Col span={24} md={12} className={styles.chartCol}>
            <Card title="销售业绩分析" className={styles.card}>
              <BarChart data={chartData.barData} title="月度销售与利润" />
            </Card>
          </Col>
          <Col span={24} md={12} className={styles.chartCol}>
            <Card title="流量分析" className={styles.card}>
              <LineChart data={chartData.lineData} title="周度访问与注册趋势" />
            </Card>
          </Col>
          <Col span={24} md={8} className={styles.chartCol}>
            <Card title="用户来源分布" className={styles.card}>
              <PieChart data={chartData.pieData} title="用户来源占比" height={300} />
            </Card>
          </Col>
          <Col span={24} md={16} className={styles.chartCol}>
            <Card title="定制图表区域" className={styles.card}>
              <div className={styles.emptyChart}>
                <p>拖拽图表组件到此处</p>
                <p style={{ fontSize: 12, color: '#999' }}>或点击下方按钮添加图表</p>
                <Button type="dashed" style={{ marginTop: 10 }}>添加图表</Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageContainer>
  );
};

export default Dashboard;