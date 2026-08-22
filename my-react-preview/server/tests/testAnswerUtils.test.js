const test = require('node:test');
const assert = require('node:assert/strict');

const { normalizeOptionValue, resolveCorrectLetter } = require('../src/utils/testAnswerUtils');

test('normalizes numeric indexes and letter strings to option letters', () => {
  assert.equal(normalizeOptionValue(0), 'A');
  assert.equal(normalizeOptionValue('2'), 'C');
  assert.equal(normalizeOptionValue('b'), 'B');
  assert.equal(normalizeOptionValue('D'), 'D');
});

test('normalizes numeric answer indexes from the browser into option letters', () => {
  assert.equal(normalizeOptionValue(1), 'B');
  assert.equal(normalizeOptionValue('3'), 'D');
});

test('resolves the correct answer from correct_option or correct_answer text', () => {
  const fromOptionLetter = resolveCorrectLetter({ correct_option: 'C' });
  assert.equal(fromOptionLetter, 'C');

  const fromFallbackText = resolveCorrectLetter({
    correct_option: null,
    correct_answer: 'The third option',
    option_a: 'First option',
    option_b: 'Second option',
    option_c: 'The third option',
    option_d: 'Fourth option',
  });
  assert.equal(fromFallbackText, 'C');

  const fromNumericCorrectIndex = resolveCorrectLetter({ correct_option: 1 });
  assert.equal(fromNumericCorrectIndex, 'B');
});
