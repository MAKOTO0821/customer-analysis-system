import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import axios from 'axios';
import '../styles/SalesChart.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function SalesChart() {
  const [salesData, setSalesData] = useState(null);
  const [chartType, setChartType] = useState('line');
  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await axios.get(`${API_URL}/sales`);
      const sales = response.data || [];

      // 日付別の売上を集計
      const salesByDate = {};
      sales.forEach(record => {
        if (record.date) {
          salesByDate[record.date] = (salesByDate[record.date] || 0) + parseInt(record.total || 0);
        }
      });

      // ソートして日付順に
      const sortedDates = Object.keys(salesByDate).sort();
      const amounts = sortedDates.map(date => salesByDate[date]);

      const chartData = {
        labels: sortedDates,
        datasets: [
          {
            label: '日別売上',
            data: amounts,
            borderColor: '#667eea',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#667eea',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      };

      setSalesData(chartData);
    } catch (error) {
      console.error('売上データ取得エラー:', error);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          font: { size: 14, weight: 'bold' },
          color: '#333',
          padding: 15
        }
      },
      title: {
        display: true,
        text: '売上推移グラフ',
        font: { size: 16, weight: 'bold' },
        color: '#333',
        padding: 15
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '¥' + value.toLocaleString();
          },
          font: { size: 12 }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        ticks: {
          font: { size: 12 }
        },
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="sales-chart">
      <h2>📈 売上分析</h2>

      <div className="chart-controls">
        <button
          className={`chart-btn ${chartType === 'line' ? 'active' : ''}`}
          onClick={() => setChartType('line')}
        >
          📉 折れ線グラフ
        </button>
        <button
          className={`chart-btn ${chartType === 'bar' ? 'active' : ''}`}
          onClick={() => setChartType('bar')}
        >
          📊 棒グラフ
        </button>
        <button className="chart-btn refresh" onClick={fetchSalesData}>
          🔄 再読込
        </button>
      </div>

      {salesData ? (
        <div className="chart-container">
          {chartType === 'line' ? (
            <Line data={salesData} options={chartOptions} />
          ) : (
            <Bar data={salesData} options={chartOptions} />
          )}
        </div>
      ) : (
        <p className="no-data">グラフデータを読み込み中...</p>
      )}
    </div>
  );
}

export default SalesChart;
