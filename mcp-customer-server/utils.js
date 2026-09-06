// ユーティリティ関数

// 1. 通貨フォーマット関数
const formatCurrency = (amount) => {
  if (typeof amount !== 'number' || amount < 0) {
    throw new Error('Invalid amount');
  }
  return '¥' + amount.toLocaleString('ja-JP');
};

// 2. 目標達成度を計算
const calculateAchievementRate = (actualSales, targetSales) => {
  if (targetSales <= 0) {
    throw new Error('Target sales must be greater than 0');
  }
  return Math.round((actualSales / targetSales) * 100);
};

// 3. パフォーマンスランクを決定
const getPerformanceRank = (achievement) => {
  if (achievement >= 100) return 'excellent';
  if (achievement >= 90) return 'great';
  if (achievement >= 75) return 'good';
  if (achievement >= 50) return 'fair';
  return 'poor';
};

// 4. 日付フォーマット
const formatDate = (date) => {
  if (!(date instanceof Date)) {
    throw new Error('Invalid date');
  }
  return date.toLocaleDateString('ja-JP');
};

// 5. 平均値計算
const calculateAverage = (numbers) => {
  if (!Array.isArray(numbers) || numbers.length === 0) {
    throw new Error('Invalid array');
  }
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return Math.round(sum / numbers.length);
};

// 6. 最大値取得
const getMaxSales = (staffData) => {
  if (!Array.isArray(staffData) || staffData.length === 0) {
    return null;
  }
  return staffData.reduce((max, staff) =>
    (staff.total_sales > max.total_sales) ? staff : max
  );
};

// 7. 最小値取得
const getMinSales = (staffData) => {
  if (!Array.isArray(staffData) || staffData.length === 0) {
    return null;
  }
  return staffData.reduce((min, staff) =>
    (staff.total_sales < min.total_sales) ? staff : min
  );
};

module.exports = {
  formatCurrency,
  calculateAchievementRate,
  getPerformanceRank,
  formatDate,
  calculateAverage,
  getMaxSales,
  getMinSales
};
