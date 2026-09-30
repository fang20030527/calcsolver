import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateExpression, formatResult } from '../src/lib/calculator.ts';

function approximately(expression: string, expected: number): void {
  const actual = evaluateExpression(expression);
  assert.ok(
    Math.abs(actual - expected) <= 1e-12 * Math.max(1, Math.abs(expected)),
    `${expression}: expected ${expected}, received ${actual}`,
  );
}

test('arithmetic obeys precedence and parentheses', () => {
  const cases: [string, number][] = [
    ['2+3*4', 14],
    ['(2+3)*4', 20],
    ['18/3/2', 3],
    ['8-3-2', 3],
    [' 12 + 6 / (1 + 2) ', 14],
    ['2 × 3 − 8 ÷ 4', 4],
  ];
  for (const [expression, expected] of cases) {
    assert.equal(evaluateExpression(expression), expected, expression);
  }
});

test('powers are right associative and bind more tightly than unary signs', () => {
  const cases: [string, number][] = [
    ['2^3^2', 512],
    ['(2^3)^2', 64],
    ['-2^2', -4],
    ['(-2)^2', 4],
    ['2^-2', 0.25],
    ['2^-2^2', 0.0625],
    ['--2 + +3', 5],
    ['2*-3', -6],
  ];
  for (const [expression, expected] of cases) {
    assert.equal(evaluateExpression(expression), expected, expression);
  }
});

test('decimals and scientific notation are numeric literals', () => {
  approximately('.5 + 1.25', 1.75);
  assert.equal(evaluateExpression('2. + 1'), 3);
  assert.equal(evaluateExpression('1e3 + 2.5E-2'), 1000.025);
  assert.equal(evaluateExpression('1e-3 * 1000'), 1);
});

test('percentage is a postfix division by one hundred', () => {
  assert.equal(evaluateExpression('50%'), 0.5);
  assert.equal(evaluateExpression('200 * 25%'), 50);
  assert.equal(evaluateExpression('(25+25)%'), 0.5);
  assert.equal(evaluateExpression('100 + 10%'), 100.1);
  assert.equal(evaluateExpression('50%%'), 0.005);
});

test('factorials use non-negative whole numbers and bind before powers', () => {
  assert.equal(evaluateExpression('0!'), 1);
  assert.equal(evaluateExpression('5!'), 120);
  assert.equal(evaluateExpression('3!^2'), 36);
  assert.equal(evaluateExpression('-3!'), -6);
  assert.equal(evaluateExpression('3!!'), 720);
  assert.ok(Number.isFinite(evaluateExpression('170!')));
  for (const expression of ['(-3)!', '2.5!', '171!']) {
    assert.throws(() => evaluateExpression(expression), /factorial.*whole number.*170/i);
  }
});

test('pi and e constants are available, including the pi symbol', () => {
  assert.equal(evaluateExpression('pi'), Math.PI);
  assert.equal(evaluateExpression('π'), Math.PI);
  assert.equal(evaluateExpression('PI'), Math.PI);
  assert.equal(evaluateExpression('e'), Math.E);
  approximately('2 * pi', 2 * Math.PI);
  approximately('ln(e)', 1);
});

test('scientific functions can be nested', () => {
  assert.equal(evaluateExpression('sqrt(81)'), 9);
  assert.equal(evaluateExpression('sqrt(9+16)'), 5);
  assert.equal(evaluateExpression('abs(-12)'), 12);
  approximately('log(1000)', 3);
  approximately('exp(2)', Math.exp(2));
  approximately('ln(exp(2))', 2);
  assert.equal(evaluateExpression('SQRT(16)'), 4);
});

test('trigonometric functions use degrees', () => {
  approximately('sin(30)', 0.5);
  approximately('cos(60)', 0.5);
  approximately('tan(45)', 1);
  approximately('sin(-30)', -0.5);
  approximately('sin(390)', 0.5);
  approximately('cos(360)', 1);
  for (const expression of ['sin(180)', 'sin(-360)', 'cos(90)', 'cos(-270)', 'tan(180)']) {
    assert.equal(evaluateExpression(expression), 0, expression);
  }
});

test('inverse trigonometric functions return degrees', () => {
  approximately('asin(0.5)', 30);
  approximately('acos(0.5)', 60);
  approximately('atan(1)', 45);
  approximately('asin(-1)', -90);
  approximately('acos(-1)', 180);
  approximately('asin(sin(30))', 30);
});

test('invalid mathematical domains produce understandable errors', () => {
  assert.throws(() => evaluateExpression('1/0'), /divide by zero/i);
  assert.throws(() => evaluateExpression('1/(-0)'), /divide by zero/i);
  assert.throws(() => evaluateExpression('sqrt(-1)'), /square root.*non-negative/i);
  for (const expression of ['ln(0)', 'ln(-1)', 'log(0)']) {
    assert.throws(() => evaluateExpression(expression), /logarithm.*positive/i);
  }
  for (const expression of ['asin(2)', 'acos(-2)']) {
    assert.throws(() => evaluateExpression(expression), /-1.*1/i);
  }
  for (const expression of ['tan(90)', 'tan(270)']) {
    assert.throws(() => evaluateExpression(expression), /tangent.*undefined/i);
  }
  assert.throws(() => evaluateExpression('(-1)^0.5'), /real number/i);
});

test('non-finite numbers and intermediate results are rejected', () => {
  for (const expression of ['1e309', '1e308*10', '10^1000', 'exp(1000)']) {
    assert.throws(() => evaluateExpression(expression), /too large/i);
  }
  assert.throws(() => evaluateExpression('(1e308*10)-(1e308*10)'), /too large/i);
});

test('malformed expressions fail without evaluating JavaScript', () => {
  const expressions = [
    '',
    '   ',
    '1+',
    '(2+3',
    '2+3)',
    '2 3',
    '1..2',
    '2**3',
    'sqrt()',
    'sqrt(1,2)',
    'sin 30',
    'unknown(2)',
    'NaN',
    'Infinity',
    'process.exit()',
    'globalThis.Math.random()',
    '1;alert(1)',
    '[1,2]',
  ];
  for (const expression of expressions) {
    assert.throws(() => evaluateExpression(expression), Error, expression);
  }
  assert.throws(() => evaluateExpression('sin 30'), /parentheses.*sin/i);
  assert.throws(() => evaluateExpression('unknown(2)'), /unknown/i);
  assert.throws(() => evaluateExpression('2 3'), /operator/i);
});

test('length, token count and recursive depth are bounded', () => {
  assert.throws(() => evaluateExpression('1'.repeat(2049)), /too long/i);
  assert.throws(() => evaluateExpression(Array(300).fill('1').join('+')), /too many/i);
  assert.equal(evaluateExpression('('.repeat(64) + '1' + ')'.repeat(64)), 1);
  assert.throws(
    () => evaluateExpression('('.repeat(65) + '1' + ')'.repeat(65)),
    /too deeply/i,
  );
  assert.throws(() => evaluateExpression('-'.repeat(65) + '1'), /too deeply/i);
  assert.throws(() => evaluateExpression(Array(67).fill('1').join('^')), /too deeply/i);
});

test('formatting removes floating point noise and unnecessary zeros', () => {
  assert.equal(formatResult(evaluateExpression('0.1+0.2')), '0.3');
  assert.equal(formatResult(12), '12');
  assert.equal(formatResult(1.25), '1.25');
  assert.equal(formatResult(1 / 3), '0.333333333333');
  assert.equal(formatResult(-0), '0');
  assert.equal(formatResult(1e25), '1e+25');
  assert.equal(formatResult(1e-9), '1e-9');
  for (const value of [NaN, Infinity, -Infinity]) {
    assert.throws(() => formatResult(value), /finite/i);
  }
});
