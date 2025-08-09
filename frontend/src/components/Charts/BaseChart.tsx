import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { EChartsOption } from 'echarts';
import styles from './BaseChart.less';

interface BaseChartProps {
  option: EChartsOption;
  width?: string | number;
  height?: string | number;
  className?: string;
  onChartReady?: (chart: echarts.ECharts) => void;
}

const BaseChart: React.FC<BaseChartProps> = ({ 
  option,
  width = '100%',
  height = '400px',
  className = '',
  onChartReady
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    // 初始化图表
    if (chartRef.current && !chartInstanceRef.current) {
      chartInstanceRef.current = echarts.init(chartRef.current);
      if (onChartReady) {
        onChartReady(chartInstanceRef.current);
      }
    }

    // 更新图表选项
    if (chartInstanceRef.current && option) {
      chartInstanceRef.current.setOption(option);
    }

    // 处理窗口大小变化
    const handleResize = () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.dispose();
        chartInstanceRef.current = null;
      }
    };
  }, [option, onChartReady]);

  return (
    <div
      ref={chartRef}
      style={{ width, height }}
      className={`${styles.chartContainer} ${className}`}
    />
  );
};

export default BaseChart;