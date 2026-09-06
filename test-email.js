#!/usr/bin/env node

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gkjdg131@gmail.com',
    pass: 'otfy sbkq vuld ybvd'
  }
});

const htmlContent = `
  <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        h1 { color: #333; }
        table { border-collapse: collapse; width: 100%; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>📊 売上分析レポート</h1>

      <div style="margin: 20px 0;">
        <h2>売上サマリー</h2>
        <table>
          <tr><th>項目</th><th>値</th></tr>
          <tr><td>総売上</td><td>¥284,000</td></tr>
          <tr><td>売上記録数</td><td>7件</td></tr>
          <tr><td>平均注文額</td><td>¥40,571</td></tr>
          <tr><td>ユニーク顧客</td><td>3社</td></tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <h2>🏆 VIP顧客トップ3</h2>
        <table>
          <tr><th>順位</th><th>顧客名</th><th>売上</th></tr>
          <tr><td>1</td><td>田中太郎</td><td>¥185,000</td></tr>
          <tr><td>2</td><td>鈴木次郎</td><td>¥69,000</td></tr>
          <tr><td>3</td><td>佐藤花子</td><td>¥30,000</td></tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <h2>👨‍💼 スタッフパフォーマンス</h2>
        <table>
          <tr><th>順位</th><th>スタッフ名</th><th>売上</th><th>取引数</th></tr>
          <tr><td>1</td><td>山田次郎</td><td>¥204,000</td><td>4回</td></tr>
          <tr><td>2</td><td>鈴木花子</td><td>¥80,000</td><td>3回</td></tr>
        </table>
      </div>

      <div style="margin: 20px 0;">
        <p>📅 生成時刻: ${new Date().toLocaleString('ja-JP')}</p>
      </div>
    </body>
  </html>
`;

const mailOptions = {
  from: 'gkjdg131@gmail.com',
  to: 'gkjdg131@gmail.com',
  subject: '📊 売上分析レポート - ' + new Date().toLocaleDateString('ja-JP'),
  html: htmlContent
};

console.log('📧 Email を送信中...');

transporter.sendMail(mailOptions, (error, info) => {
  if (error) {
    console.log('❌ エラー:', error.message);
  } else {
    console.log('✅ Email を送信しました！');
    console.log('📨 受信者:', 'gkjdg131@gmail.com');
    console.log('📝 件名:', mailOptions.subject);
  }
});
