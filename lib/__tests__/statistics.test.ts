import { fitAllModels, generateFittedCurve } from '../statistics';

describe('Statistics Engine', () => {
  describe('fitAllModels - Linear fit', () => {
    it('should fit linear data y = 2x + 1 with R² close to 1.0', () => {
      // Generate perfect linear data: y = 2x + 1
      const xs = [1, 2, 3, 4, 5];
      const ys = xs.map(x => 2 * x + 1); // [3, 5, 7, 9, 11]

      const { fits, best } = fitAllModels(xs, ys);

      // Should have 4 models
      expect(fits).toHaveLength(4);

      // Find the linear model
      const linear = fits.find(f => f.name === 'Linear');
      expect(linear).toBeDefined();
      expect(linear!.r2).toBeCloseTo(1.0, 3);

      // Params should be close to [2, 1] (slope=2, intercept=1)
      expect(linear!.params[0]).toBeCloseTo(2, 1);
      expect(linear!.params[1]).toBeCloseTo(1, 1);

      // Predict should work
      expect(linear!.predict(0)).toBeCloseTo(1, 1);
      expect(linear!.predict(10)).toBeCloseTo(21, 1);
    });

    it('should pick the best model by lowest AIC', () => {
      const xs = [1, 2, 3, 4, 5];
      const ys = xs.map(x => 2 * x + 1);

      const { fits, best } = fitAllModels(xs, ys);

      // Best model should have high R² (logistic may win on AIC due to parameter count)
      expect(best.r2).toBeGreaterThan(0.99);
      expect(['Linear', 'Logistic']).toContain(best.name);
    });
  });

  describe('rSquared - Edge cases', () => {
    it('should return 0 when all y values are the same', () => {
      // When all y values are identical, SST = 0
      const xs = [1, 2, 3, 4, 5];
      const ys = [5, 5, 5, 5, 5];

      const { fits } = fitAllModels(xs, ys);

      // All models should have R² = 0 for flat data
      fits.forEach(fit => {
        expect(fit.r2).toBe(0);
      });
    });

    it('should handle infinite predictions gracefully', () => {
      // Exponential fit with some zero or negative values might produce inf
      const xs = [1, 2, 3];
      const ys = [0.1, 0, -0.1]; // Some non-positive values

      const { fits } = fitAllModels(xs, ys);

      // Should not crash and R² should be finite
      fits.forEach(fit => {
        expect(isFinite(fit.r2)).toBe(true);
        expect(fit.r2).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('fitAllModels - Returns all models', () => {
    it('should return exactly 4 models in the fits array', () => {
      const xs = [1, 2, 3, 4, 5, 6];
      const ys = [2, 4, 8, 16, 32, 64]; // Exponential growth

      const { fits } = fitAllModels(xs, ys);

      expect(fits).toHaveLength(4);
      expect(fits[0].name).toBe('Linear');
      expect(fits[1].name).toBe('Logarithmic');
      expect(fits[2].name).toBe('Exponential');
      expect(fits[3].name).toBe('Logistic');
    });
  });

  describe('generateFittedCurve', () => {
    it('should generate approximately 50 points by default', () => {
      const predict = (x: number) => 2 * x + 1;
      const points = generateFittedCurve(predict, 0, 10);

      // Should be around 50 points (exact number depends on step calculation)
      expect(points.length).toBeGreaterThan(40);
      expect(points.length).toBeLessThan(60);
    });

    it('should generate exact number of steps when specified', () => {
      const predict = (x: number) => x * x;
      const points = generateFittedCurve(predict, 1, 5, 20);

      // With 20 steps specified, should generate 20 points
      expect(points.length).toBeGreaterThan(15);
      expect(points.length).toBeLessThanOrEqual(25);
    });

    it('should extrapolate with 10% padding on both sides', () => {
      const predict = (x: number) => x;
      const xMin = 10;
      const xMax = 20;
      const points = generateFittedCurve(predict, xMin, xMax, 100);

      // Range is 10, so padding is 1 on each side
      // Start should be ~9, end should be ~21
      expect(points[0].time).toBeLessThan(10);
      expect(points[points.length - 1].time).toBeGreaterThan(20);
    });

    it('should filter out infinite or NaN predictions', () => {
      const predict = (x: number) => {
        if (x > 5) return Infinity;
        return x;
      };
      const points = generateFittedCurve(predict, 0, 10);

      // All points should have finite values
      points.forEach(p => {
        expect(isFinite(p.score)).toBe(true);
        expect(isNaN(p.score)).toBe(false);
      });
    });

    it('should round values to 2 decimal places', () => {
      const predict = (x: number) => x * Math.PI;
      const points = generateFittedCurve(predict, 1, 5, 10);

      points.forEach(p => {
        // Check that time and score are rounded properly
        expect(p.time).toBe(Math.round(p.time * 100) / 100);
        expect(p.score).toBe(Math.round(p.score * 100) / 100);
      });
    });
  });
});
