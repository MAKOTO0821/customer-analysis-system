#!/usr/bin/env node
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'sales.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 売上データベースから全売上データを取得\n');
console.log('━'.repeat(70));

db.all('SELECT * FROM sales ORDER BY date DESC', (err, rows) => {
  if (err) {
    console.log('❌ エラー:', err.message);
  } else {
    const totalSales = rows.reduce((sum, r) => sum + (r.total || 0), 0);
    
    console.log('\n📈 全売上レコード (' + rows.length + '件):\n');
    
    rows.forEach((row, index) => {
      console.log(`${index + 1}. 日付: ${row.date}`);
      console.log(`   顧客: ${row.customer}`);
      console.log(`   製品: ${row.product}`);
      console.log(`   数量: ${row.quantity}`);
      console.log(`   単価: ¥${row.unitPrice.toLocaleString('ja-JP')}`);
      console.log(`   売上: ¥${row.total.toLocaleString('ja-JP')}`);
      console.log(`   担当: ${row.staff}`);
      console.log('');
    });
    
    console.log('━'.repeat(70));
    console.log('\n💰 総売上: ¥' + totalSales.toLocaleString('ja-JP'));
    console.log('📊 売上記録数: ' + rows.length + '件');
    console.log('📈 平均売上額: ¥' + Math.round(totalSales / rows.length).toLocaleString('ja-JP'));
  }
  db.close();
});
