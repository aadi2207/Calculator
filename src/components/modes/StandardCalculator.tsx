import React, { useState, useEffect, useRef } from 'react';
import { KeypadButton } from '../KeypadButton';
import { evaluateExpression, cleanFloat, formatDisplayNumber } from '../../utils/mathEvaluator';
import { soundEngine } from '../../utils/soundEngine';
import { Delete, CornerDownLeft } from 'lucide-react';

interface StandardCalculatorProps {
  onAddHistory: (expression: string, result: string) => void;
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

export const StandardCalculator: React.FC<StandardCalculatorProps> = ({
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

  // Auto-scaling font size based on string length
  const getDisplayFontSize = (text: string) => {
    const len = text.length;
    if (len <= 9) return 'text-4xl sm:text-5xl';
    if (len <= 13) return 'text-3xl sm:text-4xl';
    if (len <= 18) return 'text-2xl sm:text-3xl';
    return 'text-xl sm:text-2xl';
  };

  // Handle incoming insert or restore from History Tape
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
      const res = evaluateExpression(incomingExpression);
      if (res.result !== undefined) {
        setDisplay(String(res.result));
      }
      setIsNewNumber(false);
      onClearIncoming?.();
    }
  }, [incomingExpression]);

  // Input Digit
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

  // Input Decimal Point
  const handleDecimal = () => {
    if (lastEvaluated || isNewNumber) {
      setDisplay('0.');
      setIsNewNumber(false);
      setLastEvaluated(false);
    } else if (!display.includes('.')) {
      setDisplay(prev => prev + '.');
    }
  };

  // Input Binary Operator (+, -, *, /)
  const handleOperator = (op: string) => {
    const currentVal = parseFloat(display) || 0;
    const opDisplay = op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : '+';

    if (lastEvaluated) {
      setExpression(`${cleanFloat(currentVal)} ${opDisplay} `);
      setLastEvaluated(false);
    } else if (expression && !isNewNumber) {
      // Evaluate previous pending chain
      const fullExpr = `${expression}${currentVal}`;
      const res = evaluateExpression(fullExpr);
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

  // Parentheses
  const handleParenthesis = (p: '(' | ')') => {
    if (p === '(') {
      setExpression(prev => prev + '(');
      setIsNewNumber(true);
    } else {
      setExpression(prev => prev + display + ') ');
      setIsNewNumber(true);
    }
  };

  // Evaluate (= / Enter)
  const handleEquals = () => {
    if (!expression && !lastEvaluated) return;
    const currentVal = parseFloat(display) || 0;
    const fullExpr = expression ? `${expression}${currentVal}` : display;

    const evalRes = evaluateExpression(fullExpr);
    if (evalRes.error) {
      soundEngine.play('error');
      setDisplay('Error');
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
      onAddHistory(fullExpr, resStr);
    }
  };

  // Toggle Plus/Minus Sign
  const handleToggleSign = () => {
    const num = parseFloat(display) || 0;
    const negated = -num;
    setDisplay(String(cleanFloat(negated)));
  };

  // Percentage %
  const handlePercentage = () => {
    const num = parseFloat(display) || 0;
    const val = cleanFloat(num / 100);
    setDisplay(String(val));
    setIsNewNumber(true);
  };

  // Quick Functions: Reciprocal 1/x
  const handleReciprocal = () => {
    const num = parseFloat(display) || 0;
    if (num === 0) {
      soundEngine.play('error');
      setDisplay('Cannot divide by 0');
      setIsNewNumber(true);
      return;
    }
    const res = cleanFloat(1 / num);
    const prevDisplay = display;
    setDisplay(String(res));
    setIsNewNumber(true);
    onAddHistory(`1/(${prevDisplay})`, String(res));
  };

  // Quick Functions: Square x²
  const handleSquare = () => {
    const num = parseFloat(display) || 0;
    const res = cleanFloat(num * num);
    const prevDisplay = display;
    setDisplay(String(res));
    setIsNewNumber(true);
    onAddHistory(`(${prevDisplay})²`, String(res));
  };

  // Quick Functions: Square Root √x
  const handleSquareRoot = () => {
    const num = parseFloat(display) || 0;
    if (num < 0) {
      soundEngine.play('error');
      setDisplay('Invalid input');
      setIsNewNumber(true);
      return;
    }
    const res = cleanFloat(Math.sqrt(num));
    const prevDisplay = display;
    setDisplay(String(res));
    setIsNewNumber(true);
    onAddHistory(`√(${prevDisplay})`, String(res));
  };

  // Clear Entry (CE)
  const handleClearEntry = () => {
    setDisplay('0');
    setIsNewNumber(true);
  };

  // Clear All (C)
  const handleClearAll = () => {
    setDisplay('0');
    setExpression('');
    setIsNewNumber(true);
    setLastEvaluated(false);
  };

  // Backspace
  const handleBackspace = () => {
    if (lastEvaluated || isNewNumber) return;
    if (display.length <= 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
      setIsNewNumber(true);
    } else {
      setDisplay(prev => prev.slice(0, -1));
    }
  };

  // Memory Handlers
  const handleMemoryStore = () => {
    const val = parseFloat(display) || 0;
    onMemoryStore(val);
  };

  const handleMemoryRecall = () => {
    const val = onMemoryRecall();
    setDisplay(String(val));
    setIsNewNumber(true);
  };

  const handleMemoryAdd = () => {
    const val = parseFloat(display) || 0;
    onMemoryAdd(val);
  };

  const handleMemorySubtract = () => {
    const val = parseFloat(display) || 0;
    onMemorySubtract(val);
  };

  // Global Keyboard listener for Standard Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

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
      } else if (e.key === '%') {
        soundEngine.play('operator');
        handlePercentage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [display, expression, isNewNumber, lastEvaluated]);

  return (
    <div className="w-full max-w-md mx-auto flex flex-col gap-3">
      {/* Visual Calculator Display Console */}
      <div className="relative p-5 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col justify-end min-h-[140px] overflow-hidden transition-all">
        {/* Subtle decorative gridlines & screen reflection */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

        {/* Expression Tape Preview */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-mono text-theme-text-muted min-h-[22px] tracking-wide select-text">
          <span className="truncate max-w-[280px]">
            {expression || ' '}
          </span>
          {hasMemory && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-theme-accent/20 text-theme-accent border border-theme-accent/30 font-bold shrink-0">
              M: {memory}
            </span>
          )}
        </div>

        {/* Primary Numerical Display */}
        <div className="mt-1 flex items-baseline justify-end overflow-hidden">
          <div
            className={`font-mono font-bold tracking-tight text-theme-text tabular-nums select-text cursor-text transition-all duration-75 text-right break-all max-w-full ${getDisplayFontSize(display)}`}
          >
            {display}
          </div>
        </div>
      </div>

      {/* Memory Register Bar */}
      <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-theme-card/60 border border-theme-border/50">
        <button
          type="button"
          disabled={!hasMemory}
          onClick={() => {
            soundEngine.play('clear');
            onMemoryClear();
          }}
          className="py-1.5 text-xs font-mono font-semibold rounded-lg text-theme-text-muted hover:text-theme-danger hover:bg-theme-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          MC
        </button>
        <button
          type="button"
          disabled={!hasMemory}
          onClick={() => {
            soundEngine.play('digit');
            handleMemoryRecall();
          }}
          className="py-1.5 text-xs font-mono font-semibold rounded-lg text-theme-text-muted hover:text-theme-accent hover:bg-theme-elevated transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          MR
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.play('operator');
            handleMemoryAdd();
          }}
          className="py-1.5 text-xs font-mono font-semibold rounded-lg text-theme-text-muted hover:text-theme-accent hover:bg-theme-elevated transition-colors"
        >
          M+
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.play('operator');
            handleMemorySubtract();
          }}
          className="py-1.5 text-xs font-mono font-semibold rounded-lg text-theme-text-muted hover:text-theme-accent hover:bg-theme-elevated transition-colors"
        >
          M−
        </button>
        <button
          type="button"
          onClick={() => {
            soundEngine.play('digit');
            handleMemoryStore();
          }}
          className="py-1.5 text-xs font-mono font-semibold rounded-lg text-theme-text-muted hover:text-theme-accent hover:bg-theme-elevated transition-colors"
        >
          MS
        </button>
      </div>

      {/* Main Tactile Keypad */}
      <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
        {/* Row 1 */}
        <KeypadButton
          label="%"
          variant="fn"
          sound="operator"
          badge="%"
          onClick={handlePercentage}
        />
        <KeypadButton
          label="CE"
          variant="fn"
          sound="clear"
          onClick={handleClearEntry}
        />
        <KeypadButton
          label="C"
          variant="danger"
          sound="clear"
          badge="Esc"
          onClick={handleClearAll}
        />
        <KeypadButton
          label={<Delete className="w-5 h-5 mx-auto" />}
          variant="fn"
          sound="clear"
          badge="⌫"
          onClick={handleBackspace}
        />

        {/* Row 2: Quick Functions */}
        <KeypadButton
          label="1/x"
          variant="fn"
          sound="operator"
          onClick={handleReciprocal}
        />
        <KeypadButton
          label="x²"
          variant="fn"
          sound="operator"
          onClick={handleSquare}
        />
        <KeypadButton
          label="√x"
          variant="fn"
          sound="operator"
          onClick={handleSquareRoot}
        />
        <KeypadButton
          label="÷"
          variant="op"
          sound="operator"
          badge="/"
          onClick={() => handleOperator('/')}
        />

        {/* Row 3 */}
        <KeypadButton
          label="7"
          variant="digit"
          sound="digit"
          badge="7"
          onClick={() => handleDigit('7')}
        />
        <KeypadButton
          label="8"
          variant="digit"
          sound="digit"
          badge="8"
          onClick={() => handleDigit('8')}
        />
        <KeypadButton
          label="9"
          variant="digit"
          sound="digit"
          badge="9"
          onClick={() => handleDigit('9')}
        />
        <KeypadButton
          label="×"
          variant="op"
          sound="operator"
          badge="*"
          onClick={() => handleOperator('*')}
        />

        {/* Row 4 */}
        <KeypadButton
          label="4"
          variant="digit"
          sound="digit"
          badge="4"
          onClick={() => handleDigit('4')}
        />
        <KeypadButton
          label="5"
          variant="digit"
          sound="digit"
          badge="5"
          onClick={() => handleDigit('5')}
        />
        <KeypadButton
          label="6"
          variant="digit"
          sound="digit"
          badge="6"
          onClick={() => handleDigit('6')}
        />
        <KeypadButton
          label="−"
          variant="op"
          sound="operator"
          badge="-"
          onClick={() => handleOperator('-')}
        />

        {/* Row 5 */}
        <KeypadButton
          label="1"
          variant="digit"
          sound="digit"
          badge="1"
          onClick={() => handleDigit('1')}
        />
        <KeypadButton
          label="2"
          variant="digit"
          sound="digit"
          badge="2"
          onClick={() => handleDigit('2')}
        />
        <KeypadButton
          label="3"
          variant="digit"
          sound="digit"
          badge="3"
          onClick={() => handleDigit('3')}
        />
        <KeypadButton
          label="+"
          variant="op"
          sound="operator"
          badge="+"
          onClick={() => handleOperator('+')}
        />

        {/* Row 6 */}
        <KeypadButton
          label="±"
          variant="digit"
          sound="digit"
          onClick={handleToggleSign}
        />
        <KeypadButton
          label="0"
          variant="digit"
          sound="digit"
          badge="0"
          onClick={() => handleDigit('0')}
        />
        <KeypadButton
          label="."
          variant="digit"
          sound="digit"
          badge="."
          onClick={handleDecimal}
        />
        <KeypadButton
          label="="
          variant="equal"
          sound="equals"
          badge="↵"
          onClick={handleEquals}
        />
      </div>
    </div>
  );
};
