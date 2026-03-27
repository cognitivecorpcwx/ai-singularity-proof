import { testAcceleration, fisherCombinedTest } from '../hypothesis';

describe('Hypothesis Testing Engine', () => {
  describe('testAcceleration', () => {
    it('should detect positive acceleration with known accelerating data', () => {
      // Data with increasing acceleration (not constant, so variance > 0)
      // velocities increase over time
      const times = [0, 1, 2, 3, 4, 5, 6, 7];
      const scores = [0, 1, 3, 7, 15, 30, 55, 95];

      const result = testAcceleration(times, scores);

      // Mean acceleration should be positive
      expect(result.meanAcceleration).toBeGreaterThan(0);

      // Fraction accelerating should be high
      expect(result.fractionAccelerating).toBeGreaterThan(0.5);
    });

    it('should detect negative acceleration with known decelerating data', () => {
      // Data where growth slows down (S-curve-like saturation)
      // velocities decrease over time
      const times = [0, 1, 2, 3, 4, 5, 6, 7];
      const scores = [0, 40, 65, 80, 88, 93, 96, 97.5];

      const result = testAcceleration(times, scores);

      // Mean acceleration should be negative (decelerating)
      expect(result.meanAcceleration).toBeLessThan(0);

      // Fraction accelerating should be low
      expect(result.fractionAccelerating).toBeLessThan(0.5);
    });

    it('should return defaults when data has fewer than 3 points', () => {
      const times = [0, 1];
      const scores = [0, 1];

      const result = testAcceleration(times, scores);

      expect(result.n).toBe(0);
      expect(result.meanAcceleration).toBe(0);
      expect(result.tStatistic).toBe(0);
      expect(result.pValue).toBe(1);
      expect(result.significant005).toBe(false);
      expect(result.significant010).toBe(false);
      expect(result.accelerations).toEqual([]);
    });

    it('should handle edge case of exactly 3 points', () => {
      const times = [0, 1, 2];
      const scores = [0, 1, 4];

      const result = testAcceleration(times, scores);

      // Should compute at least one acceleration value
      expect(result.n).toBeGreaterThanOrEqual(1);
      expect(result.accelerations.length).toBeGreaterThanOrEqual(1);
    });

    it('should compute fractionAccelerating correctly', () => {
      // Mixed accelerations: [1, -1, 1, -1]
      const times = [0, 1, 2, 3, 4, 5];
      const scores = [0, 1, 1.5, 1.5, 2, 2.5];

      const result = testAcceleration(times, scores);

      // Fraction accelerating should be between 0 and 1
      expect(result.fractionAccelerating).toBeGreaterThanOrEqual(0);
      expect(result.fractionAccelerating).toBeLessThanOrEqual(1);

      // Should count positive accelerations correctly
      const posAccels = result.accelerations.filter(a => a > 0).length;
      expect(result.fractionAccelerating).toBeCloseTo(
        posAccels / Math.max(result.n, 1),
        5
      );
    });
  });

  describe('fisherCombinedTest', () => {
    it('should calculate chi2 = -2 * sum(ln(p)) for known p-values', () => {
      const pValues = [0.05, 0.05, 0.05];
      const result = fisherCombinedTest(pValues);

      // chi2 = -2 * (ln(0.05) + ln(0.05) + ln(0.05))
      // = -2 * (3 * ln(0.05))
      // ≈ -2 * (3 * -2.996) ≈ 17.976
      const expectedChi2 = -2 * pValues.reduce((s, p) => s + Math.log(p), 0);
      expect(result.chi2).toBeCloseTo(expectedChi2, 3);
    });

    it('should have df = 2*k where k is number of p-values', () => {
      const pValues = [0.05, 0.05, 0.05, 0.05];
      const result = fisherCombinedTest(pValues);

      expect(result.df).toBe(2 * pValues.length);
      expect(result.df).toBe(8);
    });

    it('should be significant when combining multiple significant p-values', () => {
      // Multiple small p-values should combine to be very significant
      const pValues = [0.001, 0.001, 0.001, 0.001];
      const result = fisherCombinedTest(pValues);

      expect(result.significant).toBe(true);
      expect(result.pValue).toBeLessThan(0.05);
    });

    it('should not be significant with large p-values', () => {
      // Large p-values should not be significant
      const pValues = [0.5, 0.5, 0.5];
      const result = fisherCombinedTest(pValues);

      expect(result.significant).toBe(false);
      expect(result.pValue).toBeGreaterThan(0.05);
    });

    it('should handle p-values close to 0 by clamping', () => {
      // Very small p-values should be clamped to 1e-10 to avoid log(0)
      const pValues = [1e-15, 1e-15];
      const result = fisherCombinedTest(pValues);

      // Should not produce NaN or Infinity
      expect(isFinite(result.chi2)).toBe(true);
      expect(isFinite(result.pValue)).toBe(true);
    });

    it('should combine moderately significant p-values', () => {
      // Two p-values of 0.05 each should combine to be more significant
      const pValues = [0.05, 0.05];
      const result = fisherCombinedTest(pValues);

      // Combined should be more significant than individual
      expect(result.chi2).toBeGreaterThan(0);
      // Exact threshold depends on chi-squared distribution, but should lean significant
      expect(result.pValue).toBeLessThan(0.15);
    });
  });

  describe('testAcceleration - Integration', () => {
    it('should handle evenly spaced time data', () => {
      const times = [1, 2, 3, 4, 5];
      const scores = [10, 15, 25, 40, 60];

      const result = testAcceleration(times, scores);

      expect(result.n).toBeGreaterThan(0);
      expect(result.accelerations.length).toBeGreaterThan(0);
      expect(isFinite(result.tStatistic)).toBe(true);
      expect(isFinite(result.pValue)).toBe(true);
    });

    it('should handle unevenly spaced time data', () => {
      const times = [1, 2, 4, 7, 11]; // Irregular spacing
      const scores = [10, 15, 25, 40, 60];

      const result = testAcceleration(times, scores);

      expect(result.n).toBeGreaterThan(0);
      expect(isFinite(result.meanAcceleration)).toBe(true);
      expect(isFinite(result.pValue)).toBe(true);
    });

    it('should distinguish between acceleration and deceleration', () => {
      // Accelerating: velocities increase with varying acceleration
      const accelTimes = [0, 1, 2, 3, 4, 5, 6];
      const accelScores = [0, 1, 3, 7, 15, 30, 55];

      const accelResult = testAcceleration(accelTimes, accelScores);

      // Decelerating: velocities decrease (S-curve saturation)
      const decelTimes = [0, 1, 2, 3, 4, 5, 6];
      const decelScores = [0, 30, 55, 72, 83, 90, 94];

      const decelResult = testAcceleration(decelTimes, decelScores);

      // Accelerating data should have higher fraction accelerating
      expect(accelResult.fractionAccelerating).toBeGreaterThan(decelResult.fractionAccelerating);
    });
  });

  describe('fisherCombinedTest - Edge cases', () => {
    it('should handle single p-value', () => {
      const pValues = [0.02];
      const result = fisherCombinedTest(pValues);

      expect(result.df).toBe(2);
      expect(result.significant).toBe(true);
    });

    it('should handle mixed significance levels', () => {
      // Mix of significant and non-significant p-values
      const pValues = [0.01, 0.5, 0.02, 0.3];
      const result = fisherCombinedTest(pValues);

      expect(result.df).toBe(8);
      expect(isFinite(result.chi2)).toBe(true);
      expect(isFinite(result.pValue)).toBe(true);
    });

    it('should be consistent with repeated calls', () => {
      const pValues = [0.01, 0.02, 0.03];
      const result1 = fisherCombinedTest(pValues);
      const result2 = fisherCombinedTest(pValues);

      expect(result1.chi2).toBe(result2.chi2);
      expect(result1.pValue).toBe(result2.pValue);
      expect(result1.significant).toBe(result2.significant);
    });
  });
});
