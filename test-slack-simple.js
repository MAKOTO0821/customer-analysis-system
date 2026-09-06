#!/usr/bin/env node

const https = require('https');

// Webhook URL を直接設定
const webhookUrl = 'https://hooks.slack.com/services/T0BV7PQKKP0/B0BVDDZGRQU/CnpufrjNT8rpt4AvGCBs3AE';

const simpleMessage = {
  text: '🧪 テストメッセージです'
};

const postData = JSON.stringify(simpleMessage);
const url = new URL(webhookUrl);

console.log('🔗 URL:', webhookUrl);
console.log('📤 送信中...');

const options = {
  hostname: url.hostname,
  path: url.pathname + url.search,
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = https.request(options, (res) => {
  console.log('📨 ステータスコード:', res.statusCode);
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ 送信成功！');
    } else {
      console.log('応答:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ 接続エラー:', error.message);
});

req.write(postData);
req.end();

setTimeout(() => {
  console.log('（5秒待機中）');
}, 5000);
