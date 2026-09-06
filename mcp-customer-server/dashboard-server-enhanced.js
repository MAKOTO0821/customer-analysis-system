#!/usr/bin/env node

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const dbPath = path.join(__dirname, '..', 'data', 'sales.db');
const db = new sqlite3.Database(dbPath);

const PORT = 3001;
const SALES_TARGET = 300000;

app.use(express.static('public'));
app.use(express.json());

// アラート判定関数
const generateAlerts = async (stats, staffData) => {
  const alerts = [];

  // アラート1: 目標達成度が90%以上
  const achievementRate = (stats.total_sales_amount / SALES_TARGET) * 100;
  if (achievementRate >= 90) {
    alerts.push({
      level: 'success',
      message: `🎉 本日の売上が目標の ${Math.round(achievementRate)}% に到達しました！`,
      timestamp: new Date().toLocaleTimeString('ja-JP')
    });
  }

  // アラート2: 売上目標未達
  if (achievementRate < 50) {
    alerts.push({
      level: 'warning',
      message: `⚠️ 本日の売上が目標の ${Math.round(achievementRate)}% に留まっています`,
      timestamp: new Date().toLocaleTimeString('ja-JP')
    });
  }

  // アラート3: スタッフ別パフォーマンスアラート
  if (staffData && staffData.length > 1) {
    const topStaff = staffData[0];
    const bottomStaff = staffData[staffData.length - 1];
    const gap = topStaff.total_sales - bottomStaff.total_sales;

    if (gap > 100000) {
      alerts.push({
        level: 'info',
        message: `📊 ${topStaff.staff} が最高パフォーマンス (¥${topStaff.total_sales.toLocaleString('ja-JP')})`,
        timestamp: new Date().toLocaleTimeString('ja-JP')
      });
    }
  }

  return alerts;
};

// 統計情報取得
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
        unique_staff: stats.staff_count,
        achievement_rate: Math.round((stats.total_sales / SALES_TARGET) * 100)
      });
    };
  });
};

// スタッフ別パフォーマンス
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

// 顧客別売上
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

// 日別売上
const getDailySales = () => {
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

app.get('/api/alerts', async (req, res) => {
  const stats = await getStatistics();
  const staffData = await getStaffPerformance();
  const alerts = await generateAlerts(stats, staffData);
  res.json(alerts);
});

app.get('/api/report/daily', async (req, res) => {
  const stats = await getStatistics();
  const staffData = await getStaffPerformance();
  const customerData = await getCustomerSales();
  const dailyData = await getDailySales();

  res.json({
    date: new Date().toLocaleDateString('ja-JP'),
    statistics: stats,
    staff_performance: staffData,
    customer_sales: customerData,
    daily_sales: dailyData
  });
});

app.get('/api/export/pdf', async (req, res) => {
  const stats = await getStatistics();
  const staffData = await getStaffPerformance();
  const customerData = await getCustomerSales();

  const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="sales-report-${new Date().toISOString().split('T')[0]}.pdf"`);

  doc.pipe(res);

  // ヘッダー
  doc.fontSize(24).font('Helvetica-Bold').text('📊 売上分析レポート', { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(new Date().toLocaleString('ja-JP'), { align: 'center' });
  doc.moveDown();

  // KPI セクション
  doc.fontSize(14).font('Helvetica-Bold').text('📈 売上サマリー');
  doc.fontSize(11).font('Helvetica');
  doc.text(`総売上: ¥${stats.total_sales_amount.toLocaleString('ja-JP')}`);
  doc.text(`売上記録数: ${stats.total_sales_records}件`);
  doc.text(`顧客数: ${stats.total_customers}社`);
  doc.text(`目標達成度: ${stats.achievement_rate}%`);
  doc.moveDown();

  // スタッフパフォーマンス
  doc.fontSize(14).font('Helvetica-Bold').text('🏆 スタッフ別パフォーマンス');
  doc.fontSize(11).font('Helvetica');
  staffData.forEach((staff, index) => {
    doc.text(`${index + 1}. ${staff.staff}: ¥${staff.total_sales.toLocaleString('ja-JP')} (${staff.transaction_count}件)`);
  });
  doc.moveDown();

  // VIP顧客
  doc.fontSize(14).font('Helvetica-Bold').text('💼 VIP顧客トップ3');
  doc.fontSize(11).font('Helvetica');
  customerData.slice(0, 3).forEach((customer, index) => {
    doc.text(`${index + 1}. ${customer.customer}: ¥${customer.total_sales.toLocaleString('ja-JP')}`);
  });

  doc.end();
});

// WebSocket接続
io.on('connection', async (socket) => {
  console.log('✅ クライアント接続: ' + socket.id);

  // 初期データ送信
  const stats = await getStatistics();
  const staffData = await getStaffPerformance();
  const customerData = await getCustomerSales();
  const alerts = await generateAlerts(stats, staffData);

  socket.emit('initial-data', {
    statistics: stats,
    staff_performance: staffData,
    customer_sales: customerData,
    alerts: alerts,
    target: SALES_TARGET
  });

  // 定期更新（5秒ごと）
  const interval = setInterval(async () => {
    const stats = await getStatistics();
    const staffData = await getStaffPerformance();
    const alerts = await generateAlerts(stats, staffData);

    socket.emit('data-update', {
      statistics: stats,
      staff_performance: staffData,
      alerts: alerts
    });
  }, 5000);

  socket.on('disconnect', () => {
    console.log('❌ クライアント切断: ' + socket.id);
    clearInterval(interval);
  });
});

server.listen(PORT, () => {
  console.log('\n🌐 強化されたダッシュボードサーバーが起動しました');
  console.log('📍 ブラウザで開く: http://localhost:' + PORT);
  console.log('');
  console.log('✨ 新機能:');
  console.log('   🔔 リアルタイムアラート機能');
  console.log('   📊 日次・週次・月次レポート');
  console.log('   📄 PDF エクスポート (/api/export/pdf)');
  console.log('');
});

process.on('SIGINT', () => {
  console.log('\n\n🛑 サーバーを停止中...');
  db.close();
  server.close();
  process.exit(0);
});
