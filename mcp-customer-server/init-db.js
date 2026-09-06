#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'sales.db');
const db = new sqlite3.Database(dbPath);

console.log('🗄️ データベースを初期化中...');

// テーブルを作成
db.serialize(() => {
  // customers テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY,
      name TEXT,
      company TEXT,
      email TEXT,
      phone TEXT,
      status TEXT,
      joinDate TEXT
    )
  `);

  // sales テーブル
  db.run(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      customer TEXT,
      product TEXT,
      quantity INTEGER,
      unitPrice INTEGER,
      total INTEGER,
      staff TEXT
    )
  `);

  // customers テーブルにデータをインポート
  const customersData = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'customers.json'), 'utf8'));

  db.run('DELETE FROM customers', () => {
    customersData.customers.forEach(customer => {
      db.run(
        'INSERT INTO customers (id, name, company, email, phone, status, joinDate) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [customer.id, customer.name, customer.company, customer.email, customer.phone, customer.status, customer.joinDate],
        (err) => {
          if (err) console.error('顧客インポートエラー:', err);
        }
      );
    });
    console.log('✅ 顧客データをインポート: ' + customersData.customers.length + ' 件');
  });

  // sales テーブルにデータをインポート
  const salesContent = fs.readFileSync(path.join(__dirname, '..', 'data', 'sales-records.csv'), 'utf8');
  const lines = salesContent.split('\n').filter(line => line.trim());

  db.run('DELETE FROM sales', () => {
    lines.slice(1).forEach(line => {
      const [date, customer, product, quantity, unitPrice, total, staff] = line.split(',').map(x => x.trim());
      db.run(
        'INSERT INTO sales (date, customer, product, quantity, unitPrice, total, staff) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [date, customer, product, parseInt(quantity), parseInt(unitPrice), parseInt(total), staff],
        (err) => {
          if (err) console.error('売上インポートエラー:', err);
        }
      );
    });
    console.log('✅ 売上データをインポート: ' + (lines.length - 1) + ' 件');
  });
});

// データベースを閉じる前に、インポートが完了するまで待つ
setTimeout(() => {
  db.all('SELECT COUNT(*) as count FROM customers', (err, rows) => {
    console.log('📊 customers テーブル: ' + rows[0].count + ' 件');
  });

  db.all('SELECT COUNT(*) as count FROM sales', (err, rows) => {
    console.log('📊 sales テーブル: ' + rows[0].count + ' 件');
    db.close(() => {
      console.log('✅ データベース初期化完了！');
    });
  });
}, 1000);
