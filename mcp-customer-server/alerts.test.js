// アラート機能のテスト

const generateAlerts = async (stats, staffData) => {
  const alerts = [];
  const SALES_TARGET = 300000;

  // アラート1: 目標達成度が90%以上
  const achievementRate = (stats.total_sales_amount / SALES_TARGET) * 100;
  if (achievementRate >= 90) {
    alerts.push({
      level: 'success',
      message: `🎉 本日の売上が目標の ${Math.round(achievementRate)}% に到達しました！`
    });
  }

  // アラート2: 売上目標未達
  if (achievementRate < 50) {
    alerts.push({
      level: 'warning',
      message: `⚠️ 本日の売上が目標の ${Math.round(achievementRate)}% に留まっています`
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
        message: `📊 ${topStaff.staff} が最高パフォーマンス (¥${topStaff.total_sales.toLocaleString('ja-JP')})`
      });
    }
  }

  return alerts;
};

describe('アラート機能テスト', () => {

  test('目標達成アラートが表示される', async () => {
    const stats = {
      total_sales_amount: 284000
    };
    const staffData = [];

    const alerts = await generateAlerts(stats, staffData);

    expect(alerts.length).toBe(1);
    expect(alerts[0].level).toBe('success');
    expect(alerts[0].message).toContain('95%');
  });

  test('目標未達アラートが表示される', async () => {
    const stats = {
      total_sales_amount: 100000
    };
    const staffData = [];

    const alerts = await generateAlerts(stats, staffData);

    expect(alerts.length).toBe(1);
    expect(alerts[0].level).toBe('warning');
    expect(alerts[0].message).toContain('33%');
  });

  test('スタッフパフォーマンスアラートが表示される', async () => {
    const stats = {
      total_sales_amount: 284000
    };
    const staffData = [
      { staff: '山田次郎', total_sales: 204000 },
      { staff: '鈴木花子', total_sales: 80000 }
    ];

    const alerts = await generateAlerts(stats, staffData);

    expect(alerts.length).toBeGreaterThan(0);
    const performanceAlert = alerts.find(a => a.level === 'info');
    expect(performanceAlert).toBeDefined();
    expect(performanceAlert.message).toContain('山田次郎');
  });

  test('複数のアラートが同時に表示される', async () => {
    const stats = {
      total_sales_amount: 284000
    };
    const staffData = [
      { staff: '山田次郎', total_sales: 204000 },
      { staff: '鈴木花子', total_sales: 80000 }
    ];

    const alerts = await generateAlerts(stats, staffData);

    expect(alerts.length).toBeGreaterThanOrEqual(2);
    expect(alerts.some(a => a.level === 'success')).toBe(true);
    expect(alerts.some(a => a.level === 'info')).toBe(true);
  });

  test('スタッフギャップが小さい場合はアラートが表示されない', async () => {
    const stats = {
      total_sales_amount: 284000
    };
    const staffData = [
      { staff: '山田次郎', total_sales: 150000 },
      { staff: '鈴木花子', total_sales: 134000 }
    ];

    const alerts = await generateAlerts(stats, staffData);

    const performanceAlert = alerts.find(a => a.level === 'info');
    expect(performanceAlert).toBeUndefined();
  });

  test('スタッフが1人の場合は個別アラートが表示されない', async () => {
    const stats = {
      total_sales_amount: 284000
    };
    const staffData = [
      { staff: '山田次郎', total_sales: 284000 }
    ];

    const alerts = await generateAlerts(stats, staffData);

    const performanceAlert = alerts.find(a => a.level === 'info');
    expect(performanceAlert).toBeUndefined();
  });
});
