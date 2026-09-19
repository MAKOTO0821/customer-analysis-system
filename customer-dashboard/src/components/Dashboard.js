import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CustomerList from './CustomerList';
import SalesChart from './SalesChart';
import SearchBox from './SearchBox';
import '../styles/Dashboard.css';

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const API_URL = 'http://localhost:3001';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // バックエンドから顧客データを取得
      const response = await axios.get(`${API_URL}/customers`);
      const customersList = response.data.customers || response.data;
      setCustomers(customersList);
      setFilteredCustomers(customersList);

      // 統計情報を計算
      const stats = {
        totalCustomers: customersList.length,
        totalSales: customersList.reduce((sum, c) => sum + (c.totalSales || 0), 0),
        avgPurchase: customersList.length > 0
          ? (customersList.reduce((sum, c) => sum + (c.totalSales || 0), 0) / customersList.length).toFixed(2)
          : 0
      };
      setStatistics(stats);
    } catch (error) {
      console.error('データ取得エラー:', error);
      alert('バックエンドに接続できません。MCPサーバーが起動していることを確認してください。');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (results) => {
    setFilteredCustomers(results.length > 0 ? results : customers);
  };

  return (
    <div className="dashboard">
      <h1>📊 顧客分析ダッシュボード</h1>

      {loading ? (
        <p className="loading">読み込み中...</p>
      ) : (
        <>
          {statistics && (
            <div className="statistics">
              <div className="stat-box">
                <h3>顧客総数</h3>
                <p className="stat-value">{statistics.totalCustomers}</p>
              </div>
              <div className="stat-box">
                <h3>総売上</h3>
                <p className="stat-value">¥{statistics.totalSales.toLocaleString()}</p>
              </div>
              <div className="stat-box">
                <h3>平均購入額</h3>
                <p className="stat-value">¥{Number(statistics.avgPurchase).toLocaleString()}</p>
              </div>
            </div>
          )}

          <button onClick={fetchData} className="refresh-btn">🔄 データ更新</button>

          <SearchBox customers={customers} onSearch={handleSearch} />

          <SalesChart />

          <CustomerList customers={filteredCustomers} />
        </>
      )}
    </div>
  );
}

export default Dashboard;
