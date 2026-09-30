const MAX_EXPRESSION_LENGTH = 2048;
const MAX_TOKENS = 512;
const MAX_DEPTH = 64;
const FUNCTION_NAMES = new Set([
  'sqrt', 'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'ln', 'log', 'abs', 'exp',
]);

type Token =
  | { kind: 'number'; text: string; value: number }
  | { kind: 'identifier' | 'operator' | 'end'; text: string };

function finiteResult(value: number): number {
  if (Number.isNaN(value)) {
    throw new Error('This calculation does not produce a real number.');
  }
  if (!Number.isFinite(value)) {
    throw new Error('The result is too large. Try smaller values.');
  }
  return value;
}

function tokenize(expression: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  while (position < expression.length) {
    const character = expression[position];
    if (/\s/.test(character)) {
      position += 1;
      continue;
    }

    const number = /^(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?/.exec(
      expression.slice(position),
    );
    if (number) {
      tokens.push({ kind: 'number', text: number[0], value: finiteResult(Number(number[0])) });
      position += number[0].length;
    } else if (character === 'π') {
      tokens.push({ kind: 'identifier', text: 'pi' });
      position += 1;
    } else {
      const identifier = /^[a-zA-Z]+/.exec(expression.slice(position));
      if (identifier) {
        tokens.push({ kind: 'identifier', text: identifier[0].toLowerCase() });
        position += identifier[0].length;
      } else {
        const symbol = character === '×' ? '*' : character === '÷' ? '/' : character === '−' ? '-' : character;
        if (!'+-*/^!%()'.includes(symbol)) {
          throw new Error(`Unsupported character: "${character}". Use a mathematical expression.`);
        }
        tokens.push({ kind: 'operator', text: symbol });
        position += 1;
      }
    }

    if (tokens.length > MAX_TOKENS) {
      throw new Error('This expression has too many values or operators. Split it into smaller steps.');
    }
  }

  tokens.push({ kind: 'end', text: '' });
  return tokens;
}

function factorial(value: number): number {
  if (!Number.isInteger(value) || value < 0 || value > 170) {
    throw new Error('Factorial needs a whole number from 0 to 170.');
  }
  let result = 1;
  for (let factor = 2; factor <= value; factor += 1) {
    result *= factor;
  }
  return finiteResult(result);
}

function radians(degrees: number): number {
  // Reducing the angle first also prevents overflow with very large degree inputs.
  return (degrees % 360) * Math.PI / 180;
}

function applyFunction(name: string, value: number): number {
  let result: number;
  switch (name) {
    case 'sqrt':
      if (value < 0) throw new Error('Square root needs a non-negative number.');
      result = Math.sqrt(value);
      break;
    case 'sin':
      result = value % 180 === 0 ? 0 : Math.sin(radians(value));
      break;
    case 'cos':
      result = Math.abs(value % 180) === 90 ? 0 : Math.cos(radians(value));
      break;
    case 'tan':
      if (Math.abs(value % 180) === 90) {
        throw new Error('Tangent is undefined at this angle.');
      }
      result = value % 180 === 0 ? 0 : Math.tan(radians(value));
      break;
    case 'asin':
    case 'acos':
      if (value < -1 || value > 1) {
        throw new Error('Inverse sine and cosine need a number from -1 to 1.');
      }
      result = (name === 'asin' ? Math.asin(value) : Math.acos(value)) * 180 / Math.PI;
      break;
    case 'atan':
      result = Math.atan(value) * 180 / Math.PI;
      break;
    case 'ln':
    case 'log':
      if (value <= 0) throw new Error('Logarithm needs a positive number.');
      result = name === 'ln' ? Math.log(value) : Math.log10(value);
      break;
    case 'abs':
      result = Math.abs(value);
      break;
    case 'exp':
      result = Math.exp(value);
      break;
    default:
      throw new Error(`Unknown function or constant: "${name}".`);
  }
  return finiteResult(result);
}

class ExpressionParser {
  private tokens: Token[];
  private position = 0;
  private depth = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  evaluate(): number {
    const result = this.addition();
    const remainder = this.peek();
    if (remainder.kind !== 'end') {
      if (remainder.kind === 'number' || remainder.kind === 'identifier' || remainder.text === '(') {
        throw new Error('Use an operator between values, for example 2 * pi.');
      }
      throw new Error(`Unexpected "${remainder.text}". Check the expression.`);
    }
    return finiteResult(result);
  }

  private peek(): Token {
    return this.tokens[this.position];
  }

  private take(symbol: string): boolean {
    if (this.peek().kind === 'operator' && this.peek().text === symbol) {
      this.position += 1;
      return true;
    }
    return false;
  }

  private nested(parse: () => number): number {
    if (this.depth >= MAX_DEPTH) {
      throw new Error('This expression is nested too deeply. Split it into smaller steps.');
    }
    this.depth += 1;
    try {
      return parse();
    } finally {
      this.depth -= 1;
    }
  }

  private addition(): number {
    let result = this.multiplication();
    while (true) {
      if (this.take('+')) result = finiteResult(result + this.multiplication());
      else if (this.take('-')) result = finiteResult(result - this.multiplication());
      else return result;
    }
  }

  private multiplication(): number {
    let result = this.unary();
    while (true) {
      if (this.take('*')) {
        result = finiteResult(result * this.unary());
      } else if (this.take('/')) {
        const divisor = this.unary();
        if (divisor === 0) throw new Error('Cannot divide by zero.');
        result = finiteResult(result / divisor);
      } else {
        return result;
      }
    }
  }

  private unary(): number {
    if (this.take('+')) return this.nested(() => this.unary());
    if (this.take('-')) return -this.nested(() => this.unary());
    return this.power();
  }

  private power(): number {
    const base = this.postfix();
    // Parsing the exponent as a unary expression allows 2^-2 and right-associative powers.
    if (this.take('^')) {
      return finiteResult(Math.pow(base, this.nested(() => this.unary())));
    }
    return base;
  }

  private postfix(): number {
    let result = this.primary();
    while (true) {
      if (this.take('!')) result = factorial(result);
      else if (this.take('%')) result /= 100;
      else return result;
    }
  }

  private primary(): number {
    const token = this.peek();
    if (token.kind === 'number') {
      this.position += 1;
      return token.value;
    }

    if (token.kind === 'identifier') {
      this.position += 1;
      if (token.text === 'pi') return Math.PI;
      if (token.text === 'e') return Math.E;
      if (!FUNCTION_NAMES.has(token.text)) {
        throw new Error(`Unknown function or constant: "${token.text}".`);
      }
      if (!this.take('(')) {
        throw new Error(`Use parentheses after ${token.text}, for example ${token.text}(30).`);
      }
      const argument = this.nested(() => this.addition());
      if (!this.take(')')) throw new Error('Add a closing parenthesis after the function argument.');
      return applyFunction(token.text, argument);
    }

    if (this.take('(')) {
      const result = this.nested(() => this.addition());
      if (!this.take(')')) throw new Error('Add a closing parenthesis.');
      return result;
    }

    if (token.kind === 'end') {
      throw new Error('The expression is incomplete. Enter a number or a function.');
    }
    throw new Error(`Unexpected "${token.text}". Enter a number, a function, or an opening parenthesis.`);
  }
}

/** Evaluate a restricted real-number expression; trigonometric arguments use degrees. */
export function evaluateExpression(expression: string): number {
  if (expression.length > MAX_EXPRESSION_LENGTH) {
    throw new Error('This expression is too long. Split it into smaller steps.');
  }
  if (!expression.trim()) throw new Error('Enter an expression first.');
  return new ExpressionParser(tokenize(expression)).evaluate();
}

/** Keep twelve significant digits for a readable display without common floating-point noise. */
export function formatResult(value: number): string {
  if (!Number.isFinite(value)) throw new Error('Only finite results can be displayed.');
  return Number(value.toPrecision(12)).toString();
}
