/**
 * Minimal tests for the pure date logic (no network, no Apps Script services).
 * Run `runTests` from the Apps Script editor, or `clasp run runTests`, then read
 * the execution log. Returns the report so it is also visible from clasp run.
 */
function runTests() {
  const results = [];
  const test = (name, fn) => {
    try {
      fn();
      results.push(`PASS  ${name}`);
    } catch (e) {
      results.push(`FAIL  ${name}: ${e.message}`);
    }
  };
  const eq = (actual, expected) => {
    if (actual !== expected) {
      throw new Error(`expected ${expected}, got ${actual}`);
    }
  };
  const day = (month, year, holidays) =>
    toYmd_(firstWorkingDayAfterTenth_(month, year, holidays || new Set()));

  test('toYmd_ pads single-digit month and day', () => {
    eq(toYmd_(new Date(2024, 0, 5)), '2024-01-05');
  });

  test('weekday 10th is returned unchanged (2024-12-10, Tue)', () => {
    eq(day(12, 2024), '2024-12-10');
  });

  test('Saturday 10th -> Monday 12th (2024-08-10)', () => {
    eq(day(8, 2024), '2024-08-12');
  });

  test('Sunday 10th -> Monday 11th (2024-03-10)', () => {
    eq(day(3, 2024), '2024-03-11');
  });

  test('holiday on a weekday 10th -> next business day', () => {
    eq(day(12, 2024, new Set(['2024-12-10'])), '2024-12-11');
  });

  test('holiday Friday then weekend -> following Monday (2024-05-10)', () => {
    eq(day(5, 2024, new Set(['2024-05-10'])), '2024-05-13');
  });

  const report = results.join('\n');
  Logger.log(report);
  return report;
}
