const LETTERS = ['A', 'B', 'C', 'D'];

function normalizeOptionValue(value) {
  if (value === null || value === undefined || value === '') return null;

  if (typeof value === 'number') {
    if (!Number.isInteger(value)) return null;
    return LETTERS[value] || null;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const upper = trimmed.toUpperCase();
    if (LETTERS.includes(upper)) return upper;

    const asNumber = Number(trimmed);
    if (Number.isInteger(asNumber)) return LETTERS[asNumber] || null;

    const match = trimmed.match(/^[A-D]$/i);
    if (match) return upper;
  }

  return null;
}

function resolveCorrectLetter(question) {
  if (!question) return null;

  const direct = normalizeOptionValue(question.correct_option);
  if (direct) return direct;

  const fallback = normalizeOptionValue(question.correct_answer);
  if (fallback) return fallback;

  const optionValues = ['option_a', 'option_b', 'option_c', 'option_d']
    .map((key) => question[key])
    .filter((val) => val !== null && val !== undefined && val !== '');

  const answerText = (question.correct_answer || '').toString().trim().toLowerCase();
  if (!answerText) return null;

  const matchIndex = optionValues.findIndex((opt) => {
    const text = (opt || '').toString().trim().toLowerCase();
    return text === answerText;
  });

  if (matchIndex >= 0) return LETTERS[matchIndex];
  return null;
}

module.exports = { normalizeOptionValue, resolveCorrectLetter };
