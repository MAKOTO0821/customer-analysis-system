#!/usr/bin/env node
const https = require('https');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// .env ファイルを読み込む
const envPath = path.join(__dirname, '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.trim();
  }
});

const slackWebhookUrl = env.SLACK_WEBHOOK_URL;

if (!slackWebhookUrl) {
  console.log('❌ エラー: SLACK_WEBHOOK_URL が設定されていません');
  process.exit(1);
}

const dbPath = path.join(__dirname, '..', 'data', 'sales.db');
const db = new sqlite3.Database(dbPath);

console.log('📊 Slack に売上レポートを送信中...\n');

// データベースから統計情報を取得
let stats = { customers: 0, sales: 0, total_sales: 0 };
let completed = 0;

db.get('SELECT COUNT(*) as count FROM customers', (err, row) => {
  if (!err) stats.customers = row.count;
  completed++;
  if (completed === 3) sendSlackMessage();
});

db.get('SELECT COUNT(*) as count FROM sales', (err, row) => {
  if (!err) stats.sales = row.count;
  completed++;
  if (completed === 3) sendSlackMessage();
});

db.get('SELECT SUM(total) as total FROM sales', (err, row) => {
  if (!err) stats.total_sales = row.total || 0;
  completed++;
  if (completed === 3) sendSlackMessage();
});

const sendSlackMessage = () => {
  db.all('SELECT staff, SUM(total) as total_sales, COUNT(*) as count FROM sales GROUP BY staff ORDER BY total_sales DESC LIMIT 2', (err, staffData) => {
    const staffList = staffData.map(s => `• *${s.staff}*: ¥${s.total_sales.toLocaleString('ja-JP')} (${s.count}件)`).join('\n');
    
    const message = {
      text: '📊 売上レポート',
      blocks: [
        {
          type: 'header',
          text: {
            type: 'plain_text',
            text: '📊 本日の売上レポート',
            emoji: true
          }
        },
        {
          type: 'section',
          fields: [
            {
              type: 'mrkdwn',
              text: '*💰 総売上*\n¥' + stats.total_sales.toLocaleString('ja-JP')
            },
            {
              type: 'mrkdwn',
              text: '*📋 売上記録数*\n' + stats.sales + ' 件'
            },
            {
              type: 'mrkdwn',
              text: '*👥 顧客数*\n' + stats.customers + ' 社'
            },
            {
              type: 'mrkdwn',
              text: '*📈 平均売上額*\n¥' + Math.round(stats.total_sales / stats.sales).toLocaleString('ja-JP')
            }
          ]
        },
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '*🏆 トップスタッフ*\n' + staffList
          }
        },
        {
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: '📅 ' + new Date().toLocaleString('ja-JP')
            }
          ]
        }
      ]
    };

    const payload = JSON.stringify(message);

    const url = new URL(slackWebhookUrl);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log('✅ Slack に売上レポートを送信しました！');
          console.log('');
          console.log('📊 送信内容:');
          console.log('   💰 総売上: ¥' + stats.total_sales.toLocaleString('ja-JP'));
          console.log('   📋 売上記録数: ' + stats.sales + '件');
          console.log('   👥 顧客数: ' + stats.customers + '社');
          console.log('   🏆 トップスタッフ:');
          staffData.forEach(s => {
            console.log('      - ' + s.staff + ': ¥' + s.total_sales.toLocaleString('ja-JP'));
          });
        } else {
          console.log('❌ エラー: ステータス ' + res.statusCode);
          console.log('レスポンス:', data);
        }
        db.close();
      });
    });

    req.on('error', (e) => {
      console.log('❌ エラー:', e.message);
      db.close();
    });

    req.write(payload);
    req.end();
  });
};
