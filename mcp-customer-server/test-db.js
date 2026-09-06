#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'sales.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️ データベース統計情報を取得中...\n');

db.all('SELECT COUNT(*) as count FROM customers', (err, rows) => {
  if (!err) {
    console.log('📊 customers テーブル: ' + rows[0].count + ' 件');
  }
});

db.all('SELECT COUNT(*) as count FROM sales', (err, rows) => {
  if (!err) {
    console.log('📊 sales テーブル: ' + rows[0].count + ' 件');
  }
});

db.all('SELECT SUM(total) as total FROM sales', (err, rows) => {
  if (!err) {
    console.log('💰 総売上: ¥' + (rows[0].total || 0).toLocaleString('ja-JP'));
  }
});

db.all('SELECT * FROM customers LIMIT 3', (err, rows) => {
  if (!err) {
    console.log('\n👥 顧客データ（最初の3件）:');
    rows.forEach(c => {
      console.log(`  - ${c.name} (${c.company})`);
    });
  }
  db.close();
  console.log('\n✅ テスト完了！');
});
