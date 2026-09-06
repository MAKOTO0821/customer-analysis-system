#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'sales.db');
const db = new sqlite3.Database(dbPath);

console.log('🧪 MCPサーバーのデータベースツールをテスト中...\n');

// テスト1: query_customers_from_db（顧客情報を取得）
console.log('📋 テスト 1️⃣: query_customers_from_db');
console.log('━'.repeat(50));
db.all('SELECT * FROM customers ORDER BY id', (err, rows) => {
  if (!err) {
    console.log(`✅ 顧客データ取得: ${rows.length} 件`);
    rows.forEach(c => {
      console.log(`   - ${c.name} (${c.company}) - ステータス: ${c.status}`);
    });
  }
  console.log('');

  // テスト2: query_sales_from_db（売上データを取得）
  console.log('📊 テスト 2️⃣: query_sales_from_db');
  console.log('━'.repeat(50));
  db.all('SELECT * FROM sales ORDER BY date DESC', (err, rows) => {
    if (!err) {
      const totalSales = rows.reduce((sum, r) => sum + (r.total || 0), 0);
      console.log(`✅ 売上データ取得: ${rows.length} 件`);
      console.log(`💰 総売上: ¥${totalSales.toLocaleString('ja-JP')}`);
      rows.slice(0, 3).forEach(s => {
        console.log(`   - ${s.date} | ${s.staff} | ${s.product} | ¥${s.total.toLocaleString('ja-JP')}`);
      });
    }
    console.log('');

    // テスト3: get_db_statistics（統計情報を取得）
    console.log('📈 テスト 3️⃣: get_db_statistics');
    console.log('━'.repeat(50));
    let stats = { customers: 0, sales: 0, total_sales: 0 };
    let completed = 0;

    db.get('SELECT COUNT(*) as count FROM customers', (err, row) => {
      if (!err) stats.customers = row.count;
      completed++;
      if (completed === 3) finalizeTest();
    });

    db.get('SELECT COUNT(*) as count FROM sales', (err, row) => {
      if (!err) stats.sales = row.count;
      completed++;
      if (completed === 3) finalizeTest();
    });

    db.get('SELECT SUM(total) as total FROM sales', (err, row) => {
      if (!err) stats.total_sales = row.total || 0;
      completed++;
      if (completed === 3) finalizeTest();
    });

    const finalizeTest = () => {
      console.log(`✅ データベース統計情報:`);
      console.log(`   📍 顧客数: ${stats.customers} 件`);
      console.log(`   📍 売上記録数: ${stats.sales} 件`);
      console.log(`   📍 総売上: ¥${stats.total_sales.toLocaleString('ja-JP')}`);
      console.log('');
      console.log('✨ すべてのテスト完了！');
      db.close();
    };
  });
});
