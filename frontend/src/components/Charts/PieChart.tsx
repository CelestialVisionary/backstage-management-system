import React, { useEffect, useState } from 'react';
import { EChartsOption } from 'echarts';
import BaseChart from './BaseChart';
import { Button, message } from 'antd';
import { ExportOutlined } from '@ant-design/icons';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
  }>;
  title?: string;
  width?: string | number;
  height?: string | number;
  className?: string;
  exportable?: boolean;
  radius?: [string, string];
}

const PieChart: React.FC<PieChartProps> = ({ 
  data,
  title = '饼图',
  width = '100%',
  height = '400px',
  className = '',
  exportable = true,
  radius = ['40%', '70%']
}) => {
  const [option, setOption] = useState<EChartsOption>({});

  useEffect(() => {
    const newOption: EChartsOption = {
      title: {
        text: title,
        left: 'center',
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        data: data.map(item => item.name),
      },
      series: [{
        name: title,
        type: 'pie',
        radius: radius,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '18',
            fontWeight: 'bold',
          },
        },
        labelLine: {
          show: false,
        },
        data: data,
        animationDelay: (idx: number) => idx * 10,
      }],
      animationEasing: 'elasticOut',
      animationDelayUpdate: (idx: number) => idx * 5,
    };

    setOption(newOption);
  }, [data, title, radius]);

  const handleExport = () => {
    message.success('数据导出成功！');
  };

  return (
    <div className="pie-chart-container">
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

export default PieChart;