import React, { useEffect, useState } from 'react';
import { EChartsOption } from 'echarts';
import BaseChart from './BaseChart';
import { Button, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

interface BarChartProps {
  data: {
    xAxis: string[];
    series: Array<{
      name: string;
      data: number[];
    }>;
  };
  title?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  exportable?: boolean;
}

const BarChart: React.FC<BarChartProps> = ({ 
  data,
  title = '柱状图',
  width = '100%',
  height = '400px',
  className = '',
  exportable = true
}) => {
  const [option, setOption] = useState<EChartsOption>({});

  useEffect(() => {
    const newOption: EChartsOption = {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {
        trigger: 'axis',
      },
      legend: {
        data: data.series.map(item => item.name),
        bottom: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: data.xAxis,
      },
      yAxis: {
        type: 'value',
      },
      series: data.series.map(seriesItem => ({
        name: seriesItem.name,
        type: 'bar',
        data: seriesItem.data,
        emphasis: {
          focus: 'series',
        },
        animationDelay: (idx: number) => idx * 10,
      })),
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    };

    setOption(newOption);
  }, [data, title]);

  const handleExport = () => {
    // 这里只是模拟导出功能
    message.success('数据导出成功！');
    // 实际应用中，可以添加真实的导出逻辑
  };

  return (
    <div className="bar-chart-container">
      <BaseChart
        option={option}
        width={width}
        height={height}
        className={className}
      />
      {exportable && (
        <Button
          icon={<ExportOutlined />}
          onClick={handleExport}
          style={{ marginTop: 10 }}
          size="small"
        >
          导出数据
        </Button>
      )}
    </div>
  );
};

export default BarChart;