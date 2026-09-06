#!/usr/bin/env node

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// SQLite データベース初期化
const dbPath = path.join(__dirname, '..', 'data', 'sales.db');
const db = new sqlite3.Database(dbPath);

// ポート設定
const PORT = 3000;

// 静的ファイル配信
app.use(express.static('public'));
app.use(express.json());

// データベースから統計情報を取得する関数
const getStatistics = () => {
  return new Promise((resolve) => {
    let stats = { customers: 0, sales: 0, total_sales: 0, staff_count: 0 };
    let completed = 0;

    db.get('SELECT COUNT(*) as count FROM customers', (err, row) => {
      if (!err) stats.customers = row.count;
      completed++;
      if (completed === 4) finalizeStats();
    });

    db.get('SELECT COUNT(*) as count FROM sales', (err, row) => {
      if (!err) stats.sales = row.count;
      completed++;
      if (completed === 4) finalizeStats();
    });

    db.get('SELECT SUM(total) as total FROM sales', (err, row) => {
      if (!err) stats.total_sales = row.total || 0;
      completed++;
      if (completed === 4) finalizeStats();
    });

    db.get('SELECT COUNT(DISTINCT staff) as count FROM sales', (err, row) => {
      if (!err) stats.staff_count = row.count;
      completed++;
      if (completed === 4) finalizeStats();
    });

    const finalizeStats = () => {
      resolve({
        total_customers: stats.customers,
        total_sales_records: stats.sales,
        total_sales_amount: stats.total_sales,
        unique_staff: stats.staff_count
      });
    };
  });
};

// スタッフ別パフォーマンスを取得
const getStaffPerformance = () => {
  return new Promise((resolve) => {
    db.all(`
      SELECT staff, SUM(total) as total_sales, COUNT(*) as transaction_count, AVG(total) as avg_sale
      FROM sales
      GROUP BY staff
      ORDER BY total_sales DESC
    `, (err, rows) => {
      resolve(rows || []);
    });
  });
};

// 顧客別売上を取得
const getCustomerSales = () => {
  return new Promise((resolve) => {
    db.all(`
      SELECT customer, SUM(total) as total_sales, COUNT(*) as transaction_count
      FROM sales
      GROUP BY customer
      ORDER BY total_sales DESC
    `, (err, rows) => {
      resolve(rows || []);
    });
  });
};

// 時間別売上を取得（今後の拡張用）
const getHourlySales = () => {
  return new Promise((resolve) => {
    db.all(`
      SELECT date, SUM(total) as daily_total, COUNT(*) as transaction_count
      FROM sales
      GROUP BY date
      ORDER BY date DESC
    `, (err, rows) => {
      resolve(rows || []);
    });
  });
};

// REST API エンドポイント
app.get('/api/statistics', async (req, res) => {
  const stats = await getStatistics();
  res.json(stats);
});

app.get('/api/staff-performance', async (req, res) => {
  const data = await getStaffPerformance();
  res.json(data);
});

app.get('/api/customer-sales', async (req, res) => {
  const data = await getCustomerSales();
  res.json(data);
});

app.get('/api/hourly-sales', async (req, res) => {
  const data = await getHourlySales();
  res.json(data);
});

// WebSocket 接続
io.on('connection', async (socket) => {
  console.log('✅ クライアント接続: ' + socket.id);

  // 初期データを送信
  const stats = await getStatistics();
  const staffData = await getStaffPerformance();
  const customerData = await getCustomerSales();
  const hourlyData = await getHourlySales();

  socket.emit('initial-data', {
    statistics: stats,
    staff_performance: staffData,
    customer_sales: customerData,
    hourly_sales: hourlyData
  });

  // 定期的にデータを更新（5秒ごと）
  const interval = setInterval(async () => {
    const stats = await getStatistics();
    const staffData = await getStaffPerformance();
    
    socket.emit('data-update', {
      statistics: stats,
      staff_performance: staffData
    });
  }, 5000);

  socket.on('disconnect', () => {
    console.log('❌ クライアント切断: ' + socket.id);
    clearInterval(interval);
  });
});

// サーバー起動
server.listen(PORT, () => {
  console.log('\n🌐 Web ダッシュボードサーバーが起動しました');
  console.log('📍 ブラウザで開く: http://localhost:' + PORT);
  console.log('');
  console.log('✅ リアルタイムデータ配信開始（5秒ごと）');
  console.log('🔌 WebSocket リッスン中...');
  console.log('\n');
});

// サーバー停止時のクリーンアップ
process.on('SIGINT', () => {
  console.log('\n\n🛑 サーバーを停止中...');
  db.close();
  server.close();
  process.exit(0);
});
