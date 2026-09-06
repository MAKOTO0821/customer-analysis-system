const {
  formatCurrency,
  calculateAchievementRate,
  getPerformanceRank,
  formatDate,
  calculateAverage,
  getMaxSales,
  getMinSales
} = require('./utils');

describe('ユーティリティ関数テスト', () => {

  // 1. 通貨フォーマット関数のテスト
  describe('formatCurrency', () => {
    test('正の金額をフォーマットできる', () => {
      expect(formatCurrency(1000)).toBe('¥1,000');
      expect(formatCurrency(284000)).toBe('¥284,000');
      expect(formatCurrency(1000000)).toBe('¥1,000,000');
    });

    test('0をフォーマットできる', () => {
      expect(formatCurrency(0)).toBe('¥0');
    });

    test('無効な入力でエラーを投げる', () => {
      expect(() => formatCurrency(-1000)).toThrow('Invalid amount');
      expect(() => formatCurrency('abc')).toThrow('Invalid amount');
      expect(() => formatCurrency(null)).toThrow('Invalid amount');
    });
  });

  // 2. 目標達成度計算のテスト
  describe('calculateAchievementRate', () => {
    test('達成率を正しく計算できる', () => {
      expect(calculateAchievementRate(284000, 300000)).toBe(95);
      expect(calculateAchievementRate(150000, 300000)).toBe(50);
      expect(calculateAchievementRate(300000, 300000)).toBe(100);
    });

    test('小数点は四捨五入される', () => {
      expect(calculateAchievementRate(285000, 300000)).toBe(95);
    });

    test('無効な目標でエラーを投げる', () => {
      expect(() => calculateAchievementRate(100000, 0)).toThrow();
      expect(() => calculateAchievementRate(100000, -100)).toThrow();
    });
  });

  // 3. パフォーマンスランク判定のテスト
  describe('getPerformanceRank', () => {
    test('正しいランクを返す', () => {
      expect(getPerformanceRank(100)).toBe('excellent');
      expect(getPerformanceRank(95)).toBe('great');
      expect(getPerformanceRank(80)).toBe('good');
      expect(getPerformanceRank(60)).toBe('fair');
      expect(getPerformanceRank(30)).toBe('poor');
    });

    test('境界値で正しく判定される', () => {
      expect(getPerformanceRank(90)).toBe('great');
      expect(getPerformanceRank(75)).toBe('good');
      expect(getPerformanceRank(50)).toBe('fair');
    });
  });

  // 4. 日付フォーマット関数のテスト
  describe('formatDate', () => {
    test('Date オブジェクトをフォーマットできる', () => {
      const date = new Date('2026-09-06');
      const result = formatDate(date);
      expect(result).toContain('2026');
      expect(result).toContain('9');
    });

    test('無効な入力でエラーを投げる', () => {
      expect(() => formatDate('2026-09-06')).toThrow('Invalid date');
      expect(() => formatDate(null)).toThrow('Invalid date');
      expect(() => formatDate(123)).toThrow('Invalid date');
    });
  });

  // 5. 平均値計算のテスト
  describe('calculateAverage', () => {
    test('配列の平均値を計算できる', () => {
      expect(calculateAverage([10, 20, 30])).toBe(20);
      expect(calculateAverage([100, 200, 300])).toBe(200);
      expect(calculateAverage([50])).toBe(50);
    });

    test('小数点は四捨五入される', () => {
      expect(calculateAverage([10, 20, 25])).toBe(18);
    });

    test('無効な入力でエラーを投げる', () => {
      expect(() => calculateAverage([])).toThrow('Invalid array');
      expect(() => calculateAverage(null)).toThrow('Invalid array');
      expect(() => calculateAverage('array')).toThrow('Invalid array');
    });
  });

  // 6. 最大値取得のテスト
  describe('getMaxSales', () => {
    test('最大売上スタッフを取得できる', () => {
      const staffData = [
        { staff: '山田次郎', total_sales: 204000 },
        { staff: '鈴木花子', total_sales: 80000 }
      ];
      const max = getMaxSales(staffData);
      expect(max.staff).toBe('山田次郎');
      expect(max.total_sales).toBe(204000);
    });

    test('空配列で null を返す', () => {
      expect(getMaxSales([])).toBeNull();
      expect(getMaxSales(null)).toBeNull();
    });
  });

  // 7. 最小値取得のテスト
  describe('getMinSales', () => {
    test('最小売上スタッフを取得できる', () => {
      const staffData = [
        { staff: '山田次郎', total_sales: 204000 },
        { staff: '鈴木花子', total_sales: 80000 }
      ];
      const min = getMinSales(staffData);
      expect(min.staff).toBe('鈴木花子');
      expect(min.total_sales).toBe(80000);
    });

    test('空配列で null を返す', () => {
      expect(getMinSales([])).toBeNull();
      expect(getMinSales(null)).toBeNull();
    });
  });
});
