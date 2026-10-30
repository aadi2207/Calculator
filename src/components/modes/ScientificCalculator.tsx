import React, { useState, useEffect } from 'react';
import { KeypadButton } from '../KeypadButton';
import { evaluateExpression, cleanFloat, AngleMode, factorial } from '../../utils/mathEvaluator';
import { soundEngine } from '../../utils/soundEngine';
import { Delete } from 'lucide-react';

interface ScientificCalculatorProps {
  onAddHistory: (expression: string, result: string, meta?: string) => void;
  memory: number;
  hasMemory: boolean;
  onMemoryStore: (val: number) => void;
  onMemoryClear: () => void;
  onMemoryRecall: () => number;
  onMemoryAdd: (val: number) => void;
  onMemorySubtract: (val: number) => void;
  incomingInsert?: string | null;
  incomingExpression?: string | null;
  onClearIncoming?: () => void;
}

export const ScientificCalculator: React.FC<ScientificCalculatorProps> = ({
  onAddHistory,
  memory,
  hasMemory,
  onMemoryStore,
  onMemoryClear,
  onMemoryRecall,
  onMemoryAdd,
  onMemorySubtract,
  incomingInsert,
  incomingExpression,
  onClearIncoming,
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [isNewNumber, setIsNewNumber] = useState<boolean>(true);
  const [lastEvaluated, setLastEvaluated] = useState<boolean>(false);
  const [isSecondActive, setIsSecondActive] = useState<boolean>(false);
  const [isHypActive, setIsHypActive] = useState<boolean>(false);
  const [angleMode, setAngleMode] = useState<AngleMode>('DEG');

  // Handle incoming insert or restore
  useEffect(() => {
    if (incomingInsert !== undefined && incomingInsert !== null) {
      setDisplay(incomingInsert);
      setIsNewNumber(false);
      onClearIncoming?.();
    }
  }, [incomingInsert]);

  useEffect(() => {
    if (incomingExpression !== undefined && incomingExpression !== null) {
      setExpression(incomingExpression);
      const res = evaluateExpression(incomingExpression, angleMode);
      if (res.result !== undefined) {
        setDisplay(String(res.result));
      }
      setIsNewNumber(false);
      onClearIncoming?.();
    }
  }, [incomingExpression]);

  const getDisplayFontSize = (text: string) => {
    const len = text.length;
    if (len <= 11) return 'text-3xl sm:text-4xl';
    if (len <= 16) return 'text-2xl sm:text-3xl';
    if (len <= 22) return 'text-xl sm:text-2xl';
    return 'text-lg sm:text-xl';
  };

  const toggleAngleMode = () => {
    soundEngine.play('toggle');
    setAngleMode(prev => (prev === 'DEG' ? 'RAD' : 'DEG'));
  };

  const handleDigit = (digit: string) => {
    if (lastEvaluated || isNewNumber) {
      setDisplay(digit);
      setIsNewNumber(false);
      setLastEvaluated(false);
    } else {
      if (display === '0' && digit !== '.') {
        setDisplay(digit);
      } else {
        setDisplay(prev => prev + digit);
      }
    }
  };

  const handleDecimal = () => {
    if (lastEvaluated || isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
      setLastEvaluated(false);
    } else if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  };

  const handleConstant = (c: 'pi' | 'e') => {
    const val = c === 'pi' ? Math.PI : Math.E;
    setDisplay(String(cleanFloat(val, 10)));
    setIsNewNumber(true);
    setLastEvaluated(false);
  };

  const handleOperator = (op: string) => {
    const currentVal = parseFloat(display) || 0;
    const opDisplay = op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : '+';

    if (lastEvaluated) {
      setExpression(`${cleanFloat(currentVal)} ${opDisplay} `);
      setLastEvaluated(false);
    } else if (expression && !isNewNumber) {
      const fullExpr = `${expression}${currentVal}`;
      const res = evaluateExpression(fullExpr, angleMode);
      if (res.result !== undefined) {
        setDisplay(String(res.result));
        setExpression(`${cleanFloat(res.result)} ${opDisplay} `);
      } else {
        setExpression(`${expression}${currentVal} ${opDisplay} `);
      }
    } else {
      setExpression(`${cleanFloat(currentVal)} ${opDisplay} `);
    }
    setIsNewNumber(true);
  };

  const handlePowerOperator = () => {
    const currentVal = parseFloat(display) || 0;
    setExpression(`${cleanFloat(currentVal)} ^ `);
    setIsNewNumber(true);
  };

  const handleModuloOperator = () => {
    const currentVal = parseFloat(display) || 0;
    setExpression(`${cleanFloat(currentVal)} % `);
    setIsNewNumber(true);
  };

  const handleScientificExp = () => {
    if (!display.includes('e')) {
      setDisplay(prev => prev + 'e+');
      setIsNewNumber(false);
    }
  };

  const handleParenthesis = (p: '(' | ')') => {
    if (p === '(') {
      setExpression(prev => prev + '(');
      setIsNewNumber(true);
    } else {
      setExpression(prev => prev + display + ') ');
      setIsNewNumber(true);
    }
  };

  const handleEquals = () => {
    if (!expression && !lastEvaluated) return;
    const currentVal = parseFloat(display) || 0;
    const fullExpr = expression ? `${expression}${currentVal}` : display;

    const evalRes = evaluateExpression(fullExpr, angleMode);
    if (evalRes.error) {
      soundEngine.play('error');
      setDisplay('Error: ' + evalRes.error);
      setLastEvaluated(true);
      return;
    }

    if (evalRes.result !== undefined) {
      const cleanResult = cleanFloat(evalRes.result);
      const resStr = String(cleanResult);
      setDisplay(resStr);
      setExpression(`${fullExpr} =`);
      setLastEvaluated(true);
      setIsNewNumber(true);
      onAddHistory(fullExpr, resStr, `Sci · ${angleMode}`);
    }
  };

  // Immediate Unary Scientific Functions
  const applyUnaryFunction = (fnName: string, exprPattern: (d: string) => string, calculate: (n: number) => number) => {
    const num = parseFloat(display) || 0;
    try {
      const res = calculate(num);
      if (isNaN(res) || !isFinite(res)) {
        soundEngine.play('error');
        setDisplay('Invalid input');
        setIsNewNumber(true);
        return;
      }
      const cleaned = cleanFloat(res);
      const fullExpr = exprPattern(display);
      setDisplay(String(cleaned));
      setIsNewNumber(true);
      onAddHistory(fullExpr, String(cleaned), `Sci · ${angleMode}`);
    } catch {
      soundEngine.play('error');
      setDisplay('Error');
      setIsNewNumber(true);
    }
  };

  // Trig calculation dispatch with angle mode & 2nd/hyp modifiers
  const handleTrig = (func: 'sin' | 'cos' | 'tan') => {
    let fnIdent: string = func;
    if (isSecondActive && isHypActive) {
      fnIdent = `a${func}h`;
    } else if (isSecondActive) {
      fnIdent = `a${func}`;
    } else if (isHypActive) {
      fnIdent = `${func}h`;
    }

    const radFactor = angleMode === 'DEG' ? Math.PI / 180 : 1;
    const fromRadFactor = angleMode === 'DEG' ? 180 / Math.PI : 1;

    applyUnaryFunction(
      fnIdent,
      d => `${fnIdent}(${d})`,
      n => {
        switch (fnIdent) {
          case 'sin': return Math.sin(n * radFactor);
          case 'cos': return Math.cos(n * radFactor);
          case 'tan': {
            if (Math.abs(Math.cos(n * radFactor)) < 1e-15) throw new Error();
            return Math.tan(n * radFactor);
          }
          case 'asin': return Math.asin(n) * fromRadFactor;
          case 'acos': return Math.acos(n) * fromRadFactor;
          case 'atan': return Math.atan(n) * fromRadFactor;
          case 'sinh': return Math.sinh(n);
          case 'cosh': return Math.cosh(n);
          case 'tanh': return Math.tanh(n);
          case 'asinh': return Math.asinh(n);
          case 'acosh': return Math.acosh(n);
          case 'atanh': return Math.atanh(n);
          default: return 0;
        }
      }
    );
  };

  // Logarithms
  const handleLog = (type: 'log10' | 'ln' | 'log2') => {
    applyUnaryFunction(
      type,
      d => `${type === 'log10' ? 'log' : type}(${d})`,
      n => {
        if (n <= 0) throw new Error();
        if (type === 'log10') return Math.log10(n);
        if (type === 'ln') return Math.log(n);
        return Math.log2(n);
      }
    );
  };

  // Powers & roots
  const handleSquare = () => applyUnaryFunction('sqr', d => `sqr(${d})`, n => n * n);
  const handleCube = () => applyUnaryFunction('cube', d => `cube(${d})`, n => n * n * n);
  const handleSquareRoot = () => applyUnaryFunction('sqrt', d => `√(${d})`, n => Math.sqrt(n));
  const handleCubeRoot = () => applyUnaryFunction('cbrt', d => `∛(${d})`, n => Math.cbrt(n));
  const handlePow10 = () => applyUnaryFunction('10^x', d => `10^(${d})`, n => Math.pow(10, n));
  const handleExpE = () => applyUnaryFunction('e^x', d => `e^(${d})`, n => Math.exp(n));
  const handleReciprocal = () => applyUnaryFunction('1/x', d => `1/(${d})`, n => 1 / n);
  const handleAbsolute = () => applyUnaryFunction('abs', d => `|${d}|`, n => Math.abs(n));
  const handleFactorial = () => applyUnaryFunction('n!', d => `fact(${d})`, n => factorial(n));

  const handleClearAll = () => {
    setDisplay('0');
    setExpression('');
    setIsNewNumber(true);
    setLastEvaluated(false);
  };

  const handleBackspace = () => {
    if (lastEvaluated || isNewNumber) return;
    if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
      setIsNewNumber(true);
    } else {
      setDisplay(prev => prev.slice(0, -1));
    }
  };

  // Physical keyboard support for scientific calculator
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        soundEngine.play('digit');
        handleDigit(e.key);
      } else if (e.key === '.') {
        soundEngine.play('digit');
        handleDecimal();
      } else if (e.key === '+') {
        soundEngine.play('operator');
        handleOperator('+');
      } else if (e.key === '-') {
        soundEngine.play('operator');
        handleOperator('-');
      } else if (e.key === '*') {
        soundEngine.play('operator');
        handleOperator('*');
      } else if (e.key === '/') {
        e.preventDefault();
        soundEngine.play('operator');
        handleOperator('/');
      } else if (e.key === '^') {
        soundEngine.play('operator');
        handlePowerOperator();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        soundEngine.play('equals');
        handleEquals();
      } else if (e.key === 'Backspace') {
        soundEngine.play('clear');
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        soundEngine.play('clear');
        handleClearAll();
      } else if (e.key === '(' || e.key === ')') {
        soundEngine.play('operator');
        handleParenthesis(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, expression, isNewNumber, lastEvaluated, angleMode]);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-2.5">
      {/* Display Console */}
      <div className="p-4 sm:p-5 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col justify-end min-h-[140px] overflow-hidden">
        {/* Sub-header: angle mode indicator & expression tape */}
        <div className="flex items-center justify-between text-xs font-mono text-theme-text-muted min-h-[22px]">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleAngleMode}
              className="px-2 py-0.5 rounded font-bold text-[11px] bg-theme-elevated text-theme-accent border border-theme-accent/40 hover:bg-theme-accent/15 transition-colors"
            >
              {angleMode}
            </button>
            {isSecondActive && (
              <span className="text-[10px] px-1 rounded bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30">
                2nd
              </span>
            )}
            {isHypActive && (
              <span className="text-[10px] px-1 rounded bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
                HYP
              </span>
            )}
          </div>
          <span className="truncate max-w-[320px] text-right">{expression || ' '}</span>
        </div>

        {/* Primary Scientific Readout */}
        <div className="mt-1 flex items-baseline justify-end overflow-hidden">
          <div className={`font-mono font-bold tracking-tight text-theme-text tabular-nums select-text cursor-text text-right break-all max-w-full ${getDisplayFontSize(display)}`}>
            {display}
          </div>
        </div>
      </div>

      {/* Scientific Keypad Grid (5 columns for desktop, perfectly responsive) */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {/* Modifiers & Angle */}
        <KeypadButton
          label="2nd"
          variant={isSecondActive ? 'active' : 'fn'}
          sound="toggle"
          heightClass="h-11 sm:h-12"
          onClick={() => setIsSecondActive(!isSecondActive)}
        />
        <KeypadButton
          label="hyp"
          variant={isHypActive ? 'active' : 'fn'}
          sound="toggle"
          heightClass="h-11 sm:h-12"
          onClick={() => setIsHypActive(!isHypActive)}
        />
        <KeypadButton
          label="DEG | RAD"
          variant="fn"
          sound="toggle"
          heightClass="h-11 sm:h-12"
          onClick={toggleAngleMode}
        />
        <KeypadButton
          label="C"
          variant="danger"
          sound="clear"
          badge="Esc"
          heightClass="h-11 sm:h-12"
          onClick={handleClearAll}
        />
        <KeypadButton
          label={<Delete className="w-4 h-4 mx-auto" />}
          variant="fn"
          sound="clear"
          badge="⌫"
          heightClass="h-11 sm:h-12"
          onClick={handleBackspace}
        />

        {/* Row 2: Trig functions */}
        <KeypadButton
          label={isSecondActive ? 'sin⁻¹' : isHypActive ? 'sinh' : 'sin'}
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleTrig('sin')}
        />
        <KeypadButton
          label={isSecondActive ? 'cos⁻¹' : isHypActive ? 'cosh' : 'cos'}
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleTrig('cos')}
        />
        <KeypadButton
          label={isSecondActive ? 'tan⁻¹' : isHypActive ? 'tanh' : 'tan'}
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleTrig('tan')}
        />
        <KeypadButton
          label="π"
          variant="fn"
          sound="digit"
          heightClass="h-11 sm:h-12"
          onClick={() => handleConstant('pi')}
        />
        <KeypadButton
          label="e"
          variant="fn"
          sound="digit"
          heightClass="h-11 sm:h-12"
          onClick={() => handleConstant('e')}
        />

        {/* Row 3: Logarithms & Powers */}
        <KeypadButton
          label="ln"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleLog('ln')}
        />
        <KeypadButton
          label="log₁₀"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleLog('log10')}
        />
        <KeypadButton
          label="log₂"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleLog('log2')}
        />
        <KeypadButton
          label="xʸ"
          variant="fn"
          sound="operator"
          badge="^"
          heightClass="h-11 sm:h-12"
          onClick={handlePowerOperator}
        />
        <KeypadButton
          label="√x"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleSquareRoot}
        />

        {/* Row 4: Advanced Powers & Roots */}
        <KeypadButton
          label="x²"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleSquare}
        />
        <KeypadButton
          label="x³"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleCube}
        />
        <KeypadButton
          label="10ˣ"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handlePow10}
        />
        <KeypadButton
          label="eˣ"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleExpE}
        />
        <KeypadButton
          label="∛x"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleCubeRoot}
        />

        {/* Row 5: Factorial, Abs, Grouping, Operators */}
        <KeypadButton
          label="n!"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleFactorial}
        />
        <KeypadButton
          label="|x|"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleAbsolute}
        />
        <KeypadButton
          label="("
          variant="fn"
          sound="operator"
          badge="("
          heightClass="h-11 sm:h-12"
          onClick={() => handleParenthesis('(')}
        />
        <KeypadButton
          label=")"
          variant="fn"
          sound="operator"
          badge=")"
          heightClass="h-11 sm:h-12"
          onClick={() => handleParenthesis(')')}
        />
        <KeypadButton
          label="mod"
          variant="op"
          sound="operator"
          badge="%"
          heightClass="h-11 sm:h-12"
          onClick={handleModuloOperator}
        />

        {/* Row 6: 7 8 9 and ÷ */}
        <KeypadButton
          label="1/x"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleReciprocal}
        />
        <KeypadButton
          label="7"
          variant="digit"
          sound="digit"
          badge="7"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('7')}
        />
        <KeypadButton
          label="8"
          variant="digit"
          sound="digit"
          badge="8"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('8')}
        />
        <KeypadButton
          label="9"
          variant="digit"
          sound="digit"
          badge="9"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('9')}
        />
        <KeypadButton
          label="÷"
          variant="op"
          sound="operator"
          badge="/"
          heightClass="h-11 sm:h-12"
          onClick={() => handleOperator('/')}
        />

        {/* Row 7: 4 5 6 and × */}
        <KeypadButton
          label="EXP"
          variant="fn"
          sound="digit"
          heightClass="h-11 sm:h-12"
          onClick={handleScientificExp}
        />
        <KeypadButton
          label="4"
          variant="digit"
          sound="digit"
          badge="4"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('4')}
        />
        <KeypadButton
          label="5"
          variant="digit"
          sound="digit"
          badge="5"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('5')}
        />
        <KeypadButton
          label="6"
          variant="digit"
          sound="digit"
          badge="6"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('6')}
        />
        <KeypadButton
          label="×"
          variant="op"
          sound="operator"
          badge="*"
          heightClass="h-11 sm:h-12"
          onClick={() => handleOperator('*')}
        />

        {/* Row 8: 1 2 3 and − */}
        <KeypadButton
          label="±"
          variant="digit"
          sound="digit"
          heightClass="h-11 sm:h-12"
          onClick={() => {
            const num = parseFloat(display) || 0;
            setDisplay(String(cleanFloat(-num)));
          }}
        />
        <KeypadButton
          label="1"
          variant="digit"
          sound="digit"
          badge="1"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('1')}
        />
        <KeypadButton
          label="2"
          variant="digit"
          sound="digit"
          badge="2"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('2')}
        />
        <KeypadButton
          label="3"
          variant="digit"
          sound="digit"
          badge="3"
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('3')}
        />
        <KeypadButton
          label="−"
          variant="op"
          sound="operator"
          badge="-"
          heightClass="h-11 sm:h-12"
          onClick={() => handleOperator('-')}
        />

        {/* Row 9: 0 . = + */}
        <KeypadButton
          label="0"
          variant="digit"
          sound="digit"
          badge="0"
          span={2}
          heightClass="h-11 sm:h-12"
          onClick={() => handleDigit('0')}
        />
        <KeypadButton
          label="."
          variant="digit"
          sound="digit"
          badge="."
          heightClass="h-11 sm:h-12"
          onClick={handleDecimal}
        />
        <KeypadButton
          label="="
          variant="equal"
          sound="equals"
          badge="↵"
          heightClass="h-11 sm:h-12"
          onClick={handleEquals}
        />
        <KeypadButton
          label="+"
          variant="op"
          sound="operator"
          badge="+"
          heightClass="h-11 sm:h-12"
          onClick={() => handleOperator('+')}
        />
      </div>
    </div>
  );
};
