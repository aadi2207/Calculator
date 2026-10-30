// Robust mathematical expression evaluator and floating-point stabilizer

export type AngleMode = 'DEG' | 'RAD';

// Floating-point stabilizer to eliminate 0.1 + 0.2 = 0.30000000000000004 artifacts
export function cleanFloat(num: number, precision: number = 12): number {
  if (!isFinite(num)) return num;
  if (Math.abs(num) < 1e-15) return 0;
  const rounded = parseFloat(Number(num).toPrecision(precision));
  // If it's an integer after rounding, return clean integer
  if (Math.abs(rounded - Math.round(rounded)) < 1e-11) {
    return Math.round(rounded);
  }
  return rounded;
}

export function formatDisplayNumber(val: number | string): string {
  if (typeof val === 'string') {
    const num = parseFloat(val);
    if (isNaN(num)) return val;
    val = num;
  }
  if (!isFinite(val)) {
    if (val === Infinity) return 'Infinity';
    if (val === -Infinity) return '-Infinity';
    return 'Error';
  }
  
  const absVal = Math.abs(val);
  // If extremely large or extremely small, use scientific notation
  if ((absVal >= 1e15 || (absVal > 0 && absVal < 1e-8)) && absVal !== 0) {
    return val.toExponential(8).replace(/e\+?/, 'e');
  }

  // Clean trailing zeros
  const cleaned = cleanFloat(val, 12);
  const parts = cleaned.toString().split('.');
  // Add thousands commas to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// Factorial calculation
export function factorial(n: number): number {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  if (n > 170) return Infinity; // Max JS double
  if (!Number.isInteger(n)) {
    // Stirling approximation for non-integers or gamma
    return Math.sqrt(2 * Math.PI * n) * Math.pow(n / Math.E, n);
  }
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Token types for recursive-descent expression parser
type TokenType = 
  | 'NUMBER'
  | 'IDENT'
  | 'PLUS'
  | 'MINUS'
  | 'MULTIPLY'
  | 'DIVIDE'
  | 'MOD'
  | 'POW'
  | 'LPAREN'
  | 'RPAREN'
  | 'COMMA'
  | 'EOF';

interface Token {
  type: TokenType;
  value?: string | number;
}

export class ExpressionParser {
  private pos = 0;
  private tokens: Token[] = [];
  private angleMode: AngleMode = 'DEG';

  constructor(angleMode: AngleMode = 'DEG') {
    this.angleMode = angleMode;
  }

  private toRadians(angle: number): number {
    return this.angleMode === 'DEG' ? (angle * Math.PI) / 180 : angle;
  }

  private fromRadians(rad: number): number {
    return this.angleMode === 'DEG' ? (rad * 180) / Math.PI : rad;
  }

  private tokenize(expr: string): Token[] {
    const tokens: Token[] = [];
    let i = 0;
    
    // Normalize unicode symbols
    const s = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/π/g, 'pi')
      .replace(/√/g, 'sqrt')
      .replace(/∛/g, 'cbrt')
      .replace(/\s+/g, '');

    while (i < s.length) {
      const c = s[i];

      if (c === '+') { tokens.push({ type: 'PLUS' }); i++; continue; }
      if (c === '-') { tokens.push({ type: 'MINUS' }); i++; continue; }
      if (c === '*') { tokens.push({ type: 'MULTIPLY' }); i++; continue; }
      if (c === '/') { tokens.push({ type: 'DIVIDE' }); i++; continue; }
      if (c === '%') { tokens.push({ type: 'MOD' }); i++; continue; }
      if (c === '^') { tokens.push({ type: 'POW' }); i++; continue; }
      if (c === '(') { tokens.push({ type: 'LPAREN' }); i++; continue; }
      if (c === ')') { tokens.push({ type: 'RPAREN' }); i++; continue; }
      if (c === ',') { tokens.push({ type: 'COMMA' }); i++; continue; }

      // Number (including scientific notation like 1.5e-3)
      if (/\d|\./.test(c)) {
        let numStr = '';
        while (i < s.length && /[\d.eE]/.test(s[i])) {
          // Check for exponential sign like 1e+5 or 1e-5
          if ((s[i] === 'e' || s[i] === 'E') && i + 1 < s.length && (s[i + 1] === '+' || s[i + 1] === '-')) {
            numStr += s[i] + s[i + 1];
            i += 2;
          } else {
            numStr += s[i];
            i++;
          }
        }
        tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
        continue;
      }

      // Identifier / function name / constant
      if (/[a-zA-Z_]/.test(c)) {
        let ident = '';
        while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) {
          ident += s[i];
          i++;
        }
        tokens.push({ type: 'IDENT', value: ident.toLowerCase() });
        continue;
      }

      i++; // skip unknown char
    }

    tokens.push({ type: 'EOF' });
    return tokens;
  }

  private peek(): Token {
    return this.tokens[this.pos] || { type: 'EOF' };
  }

  private next(): Token {
    return this.tokens[this.pos++];
  }

  public evaluate(expression: string): number {
    if (!expression || expression.trim() === '') return 0;
    this.tokens = this.tokenize(expression);
    this.pos = 0;
    const result = this.parseExpression();
    return cleanFloat(result);
  }

  // Expression: Term (('+' | '-') Term)*
  private parseExpression(): number {
    let result = this.parseTerm();

    while (this.peek().type === 'PLUS' || this.peek().type === 'MINUS') {
      const op = this.next().type;
      const right = this.parseTerm();
      if (op === 'PLUS') {
        result += right;
      } else {
        result -= right;
      }
    }
    return result;
  }

  // Term: Factor (('*' | '/' | '%') Factor)*
  private parseTerm(): number {
    let result = this.parsePower();

    while (this.peek().type === 'MULTIPLY' || this.peek().type === 'DIVIDE' || this.peek().type === 'MOD') {
      const op = this.next().type;
      const right = this.parsePower();
      if (op === 'MULTIPLY') {
        result *= right;
      } else if (op === 'DIVIDE') {
        if (right === 0) throw new Error('Divide by zero');
        result /= right;
      } else if (op === 'MOD') {
        if (right === 0) throw new Error('Modulo by zero');
        result %= right;
      }
    }
    return result;
  }

  // Power: Factor ('^' Power)? (right-associative)
  private parsePower(): number {
    let base = this.parseFactor();

    if (this.peek().type === 'POW') {
      this.next();
      const exp = this.parsePower(); // right-associative recursion
      base = Math.pow(base, exp);
    }
    return base;
  }

  // Factor: Unary '-' Factor | Primary
  private parseFactor(): number {
    if (this.peek().type === 'MINUS') {
      this.next();
      return -this.parseFactor();
    }
    if (this.peek().type === 'PLUS') {
      this.next();
      return this.parseFactor();
    }
    return this.parsePrimary();
  }

  // Primary: Number | Identifier | '(' Expression ')'
  private parsePrimary(): number {
    const token = this.peek();

    if (token.type === 'NUMBER') {
      this.next();
      let val = token.value as number;
      // Check for implicit multiplication like 2(3) or 2pi
      if (this.peek().type === 'LPAREN' || (this.peek().type === 'IDENT' && this.peek().value !== 'mod')) {
        val *= this.parsePower();
      }
      return val;
    }

    if (token.type === 'IDENT') {
      this.next();
      const name = token.value as string;

      // Constants
      if (name === 'pi') return Math.PI;
      if (name === 'e') return Math.E;

      // Function call: name '(' ... ')'
      if (this.peek().type === 'LPAREN') {
        this.next(); // eat '('
        const arg = this.parseExpression();
        let secondArg: number | null = null;
        if (this.peek().type === 'COMMA') {
          this.next();
          secondArg = this.parseExpression();
        }
        if (this.peek().type === 'RPAREN') {
          this.next(); // eat ')'
        }

        switch (name) {
          case 'sin': return Math.sin(this.toRadians(arg));
          case 'cos': return Math.cos(this.toRadians(arg));
          case 'tan': {
            const rad = this.toRadians(arg);
            if (Math.abs(Math.cos(rad)) < 1e-15) throw new Error('Undefined');
            return Math.tan(rad);
          }
          case 'asin': return this.fromRadians(Math.asin(arg));
          case 'acos': return this.fromRadians(Math.acos(arg));
          case 'atan': return this.fromRadians(Math.atan(arg));
          case 'sinh': return Math.sinh(arg);
          case 'cosh': return Math.cosh(arg);
          case 'tanh': return Math.tanh(arg);
          case 'asinh': return Math.asinh(arg);
          case 'acosh': return Math.acosh(arg);
          case 'atanh': return Math.atanh(arg);
          case 'log': return Math.log10(arg);
          case 'ln': return Math.log(arg);
          case 'log2': return Math.log2(arg);
          case 'sqrt': {
            if (arg < 0) throw new Error('Invalid input');
            return Math.sqrt(arg);
          }
          case 'cbrt': return Math.cbrt(arg);
          case 'abs': return Math.abs(arg);
          case 'exp': return Math.exp(arg);
          case 'fact': return factorial(arg);
          case 'root': {
            // root(x, n) is n-th root of x
            const degree = secondArg !== null ? secondArg : 2;
            return Math.pow(arg, 1 / degree);
          }
          default:
            throw new Error(`Unknown function: ${name}`);
        }
      }

      // Implicit variable or known constant without parens
      if (name === 'ans') return 0;
      throw new Error(`Unexpected identifier: ${name}`);
    }

    if (token.type === 'LPAREN') {
      this.next();
      const val = this.parseExpression();
      if (this.peek().type === 'RPAREN') {
        this.next();
      }
      return val;
    }

    return 0;
  }
}

export function evaluateExpression(expr: string, angleMode: AngleMode = 'DEG'): { result?: number; error?: string } {
  try {
    const parser = new ExpressionParser(angleMode);
    const res = parser.evaluate(expr);
    if (isNaN(res)) return { error: 'Invalid input' };
    return { result: res };
  } catch (err) {
    return { error: (err as Error).message || 'Calculation error' };
  }
}
