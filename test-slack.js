#!/usr/bin/env node

const https = require('https');

// Webhook URL を直接設定
const webhookUrl = 'https://hooks.slack.com/services/T0BV7PQKKP0/B0BVDDZGRQU/CnpufrjNT8rpt4AvGCBs3AE';

const slackMessage = {
  text: '📊 売上レポート',
  blocks: [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📊 売上分析レポート'
      }
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: '*総売上*\n¥284,000'
        },
        {
          type: 'mrkdwn',
          text: '*売上記録数*\n7件'
        },
        {
          type: 'mrkdwn',
          text: '*平均注文額*\n¥40,571'
        },
        {
          type: 'mrkdwn',
          text: '*ユニーク顧客*\n3社'
        }
      ]
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*🏆 VIP顧客トップ3*\n1. 田中太郎 - ¥185,000\n2. 鈴木次郎 - ¥69,000\n3. 佐藤花子 - ¥30,000'
      }
    },
    {
      type: 'divider'
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: '*👨‍💼 スタッフパフォーマンス*\n1. 山田次郎 - ¥204,000\n2. 鈴木花子 - ¥80,000'
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `📅 生成時刻: ${new Date().toLocaleString('ja-JP')}`
        }
      ]
    }
  ]
};

const postData = JSON.stringify(slackMessage);
const url = new URL(webhookUrl);

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
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Slack にレポートを送信しました！');
      console.log('📝 ステータスコード:', res.statusCode);
    } else {
      console.log('❌ エラー:', res.statusCode);
      console.log('応答:', data);
    }
  });
});

req.on('error', (error) => {
  console.log('❌ エラー:', error.message);
});

req.write(postData);
req.end();
