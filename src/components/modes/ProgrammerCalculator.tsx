import React, { useState, useEffect } from 'react';
import { KeypadButton } from '../KeypadButton';
import { 
  ProgrammerRadix, 
  ProgrammerWordSize 
} from '../../types/calculator';
import { 
  WORD_SIZE_BITS, 
  maskToWordSize, 
  toHexString, 
  toDecString, 
  toOctString, 
  toBinString, 
  parseRadix, 
  getBit, 
  toggleBit, 
  bitwiseNot, 
  bitwiseAnd, 
  bitwiseOr, 
  bitwiseXor, 
  bitwiseNand, 
  bitwiseNor, 
  bitwiseLsh, 
  bitwiseRsh, 
  bitwiseRol, 
  bitwiseRor, 
  isCharAllowedForRadix 
} from '../../utils/programmerMath';
import { soundEngine } from '../../utils/soundEngine';
import { Delete, Layers, ArrowLeftRight } from 'lucide-react';

interface ProgrammerCalculatorProps {
  onAddHistory: (expression: string, result: string, meta?: string) => void;
  incomingInsert?: string | null;
  onClearIncoming?: () => void;
}

type BitwiseOp = 'AND' | 'OR' | 'XOR' | 'NAND' | 'NOR' | 'LSH' | 'RSH';

export const ProgrammerCalculator: React.FC<ProgrammerCalculatorProps> = ({
  onAddHistory,
  incomingInsert,
  onClearIncoming,
}) => {
  const [value, setValue] = useState<bigint>(0n);
  const [radix, setRadix] = useState<ProgrammerRadix>('HEX');
  const [wordSize, setWordSize] = useState<ProgrammerWordSize>('QWORD');
  const [isSignedDec, setIsSignedDec] = useState<boolean>(false);
  const [currentBuffer, setCurrentBuffer] = useState<string>('0');
  const [pendingOp, setPendingOp] = useState<BitwiseOp | null>(null);
  const [pendingValue, setPendingValue] = useState<bigint | null>(null);

  // Sync buffer from bigint value whenever radix or value changes outside typing
  const syncBufferFromValue = (val: bigint, r: ProgrammerRadix, size: ProgrammerWordSize) => {
    switch (r) {
      case 'HEX':
        return toHexString(val, size);
      case 'DEC':
        return toDecString(val, size, isSignedDec);
      case 'OCT':
        return toOctString(val, size);
      case 'BIN':
        return toBinString(val, size).replace(/\s/g, '');
    }
  };

  // Handle incoming insert from history tape
  useEffect(() => {
    if (incomingInsert !== undefined && incomingInsert !== null) {
      try {
        const parsed = BigInt(incomingInsert);
        const masked = maskToWordSize(parsed, wordSize);
        setValue(masked);
        setCurrentBuffer(syncBufferFromValue(masked, radix, wordSize));
      } catch {
        // ignore
      }
      onClearIncoming?.();
    }
  }, [incomingInsert]);

  // When word size changes, mask the current value
  const handleWordSizeChange = (newSize: ProgrammerWordSize) => {
    soundEngine.play('toggle');
    setWordSize(newSize);
    const masked = maskToWordSize(value, newSize);
    setValue(masked);
    setCurrentBuffer(syncBufferFromValue(masked, radix, newSize));
  };

  // When radix changes, update active radix and refresh buffer
  const handleRadixChange = (newRadix: ProgrammerRadix) => {
    soundEngine.play('toggle');
    setRadix(newRadix);
    setCurrentBuffer(syncBufferFromValue(value, newRadix, wordSize));
  };

  // Bitboard click: toggle specific bit
  const handleBitClick = (bitIndex: number) => {
    soundEngine.play('bit');
    const newVal = toggleBit(value, bitIndex, wordSize);
    setValue(newVal);
    setCurrentBuffer(syncBufferFromValue(newVal, radix, wordSize));
  };

  // Digit/Hex key press
  const handleInputChar = (char: string) => {
    if (!isCharAllowedForRadix(char, radix)) return;

    soundEngine.play('digit');
    let nextBuffer = currentBuffer;
    if (currentBuffer === '0' || currentBuffer === '') {
      nextBuffer = char.toUpperCase();
    } else {
      nextBuffer += char.toUpperCase();
    }

    const parsed = parseRadix(nextBuffer, radix, wordSize);
    setValue(parsed);
    setCurrentBuffer(nextBuffer);
  };

  // Backspace
  const handleBackspace = () => {
    soundEngine.play('clear');
    if (currentBuffer.length <= 1) {
      setCurrentBuffer('0');
      setValue(0n);
    } else {
      const nextBuffer = currentBuffer.slice(0, -1);
      const parsed = parseRadix(nextBuffer, radix, wordSize);
      setCurrentBuffer(nextBuffer);
      setValue(parsed);
    }
  };

  // Clear
  const handleClear = () => {
    soundEngine.play('clear');
    setValue(0n);
    setCurrentBuffer('0');
    setPendingOp(null);
    setPendingValue(null);
  };

  // Unary Bitwise NOT
  const handleBitwiseNot = () => {
    soundEngine.play('operator');
    const result = bitwiseNot(value, wordSize);
    const prevHex = toHexString(value, wordSize);
    setValue(result);
    setCurrentBuffer(syncBufferFromValue(result, radix, wordSize));
    onAddHistory(`NOT(0x${prevHex})`, `0x${toHexString(result, wordSize)}`, `Prog · ${wordSize}`);
  };

  // Circular ROL / ROR
  const handleRol = () => {
    soundEngine.play('operator');
    const result = bitwiseRol(value, 1n, wordSize);
    setValue(result);
    setCurrentBuffer(syncBufferFromValue(result, radix, wordSize));
  };

  const handleRor = () => {
    soundEngine.play('operator');
    const result = bitwiseRor(value, 1n, wordSize);
    setValue(result);
    setCurrentBuffer(syncBufferFromValue(result, radix, wordSize));
  };

  // Binary Bitwise Op (+, AND, OR, XOR, etc.)
  const handleSelectOp = (op: BitwiseOp) => {
    soundEngine.play('operator');
    setPendingOp(op);
    setPendingValue(value);
    setCurrentBuffer('0');
  };

  // Evaluate Pending Op
  const handleEquals = () => {
    if (!pendingOp || pendingValue === null) return;
    soundEngine.play('equals');

    let result = 0n;
    switch (pendingOp) {
      case 'AND': result = bitwiseAnd(pendingValue, value, wordSize); break;
      case 'OR': result = bitwiseOr(pendingValue, value, wordSize); break;
      case 'XOR': result = bitwiseXor(pendingValue, value, wordSize); break;
      case 'NAND': result = bitwiseNand(pendingValue, value, wordSize); break;
      case 'NOR': result = bitwiseNor(pendingValue, value, wordSize); break;
      case 'LSH': result = bitwiseLsh(pendingValue, value, wordSize); break;
      case 'RSH': result = bitwiseRsh(pendingValue, value, wordSize); break;
    }

    const exprStr = `0x${toHexString(pendingValue, wordSize)} ${pendingOp} 0x${toHexString(value, wordSize)}`;
    const resHex = `0x${toHexString(result, wordSize)}`;

    setValue(result);
    setCurrentBuffer(syncBufferFromValue(result, radix, wordSize));
    setPendingOp(null);
    setPendingValue(null);
    onAddHistory(exprStr, resHex, `Prog · ${wordSize}`);
  };

  // Word sizes list
  const wordSizes: ProgrammerWordSize[] = ['QWORD', 'DWORD', 'WORD', 'BYTE'];

  // Readouts for all 4 bases
  const hexDisplay = toHexString(value, wordSize);
  const decDisplay = toDecString(value, wordSize, isSignedDec);
  const octDisplay = toOctString(value, wordSize);
  const binDisplay = toBinString(value, wordSize);

  // Keyboard handler for programmer mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const key = e.key.toUpperCase();
      if (isCharAllowedForRadix(key, radix)) {
        e.preventDefault();
        handleInputChar(key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle active radix
        const radices: ProgrammerRadix[] = ['HEX', 'DEC', 'OCT', 'BIN'];
        const nextIdx = (radices.indexOf(radix) + 1) % radices.length;
        handleRadixChange(radices[nextIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [value, currentBuffer, radix, wordSize, pendingOp, pendingValue, isSignedDec]);

  // Construct bitboard data (64 bits, descending from 63 down to 0)
  const activeBitsCount = WORD_SIZE_BITS[wordSize];
  const allBits = Array.from({ length: 64 }, (_, i) => 63 - i);

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-3">
      {/* Top Controls: Word Size & Signed/Unsigned DEC Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-theme-card border border-theme-border/70">
        {/* Word Size Selector */}
        <div className="flex items-center gap-1">
          <Layers className="w-4 h-4 text-theme-text-dim ml-1 mr-0.5" />
          {wordSizes.map(size => (
            <button
              key={size}
              type="button"
              onClick={() => handleWordSizeChange(size)}
              className={`
                px-2.5 py-1 rounded-lg text-xs font-mono transition-all
                ${wordSize === size 
                  ? 'bg-theme-accent text-white font-bold shadow-xs' 
                  : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated'}
              `}
            >
              {size} ({WORD_SIZE_BITS[size]}b)
            </button>
          ))}
        </div>

        {/* DEC Signed/Unsigned Toggle */}
        <button
          type="button"
          onClick={() => {
            soundEngine.play('toggle');
            setIsSignedDec(!isSignedDec);
          }}
          className={`
            px-2.5 py-1 rounded-lg text-xs font-mono border transition-all flex items-center gap-1.5
            ${isSignedDec 
              ? 'border-theme-accent/60 bg-theme-accent/10 text-theme-accent font-semibold' 
              : 'border-theme-border text-theme-text-muted hover:text-theme-text bg-theme-elevated/40'}
          `}
        >
          <span>DEC Mode:</span>
          <span className="font-bold">{isSignedDec ? 'Signed' : 'Unsigned'}</span>
        </button>
      </div>

      {/* Simultaneous Real-time 4-Radix Console */}
      <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col gap-2">
        {/* HEX Row */}
        <div 
          onClick={() => handleRadixChange('HEX')}
          className={`flex items-baseline justify-between p-2 rounded-xl cursor-pointer transition-all ${radix === 'HEX' ? 'bg-theme-accent/15 border border-theme-accent/50 text-theme-accent shadow-xs' : 'hover:bg-theme-elevated/50 border border-transparent text-theme-text-muted'}`}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold w-10">HEX</span>
            {pendingOp && pendingValue !== null && radix === 'HEX' && (
              <span className="text-[10px] text-theme-text-dim">0x{toHexString(pendingValue, wordSize)} {pendingOp}</span>
            )}
          </div>
          <span className="font-mono text-base sm:text-lg font-bold tracking-wider select-text cursor-text text-right break-all">
            {hexDisplay || '0'}
          </span>
        </div>

        {/* DEC Row */}
        <div 
          onClick={() => handleRadixChange('DEC')}
          className={`flex items-baseline justify-between p-2 rounded-xl cursor-pointer transition-all ${radix === 'DEC' ? 'bg-theme-accent/15 border border-theme-accent/50 text-theme-accent shadow-xs' : 'hover:bg-theme-elevated/50 border border-transparent text-theme-text-muted'}`}
        >
          <span className="font-mono text-xs font-bold w-10">DEC</span>
          <span className="font-mono text-base sm:text-lg font-bold select-text cursor-text text-right break-all">
            {decDisplay || '0'}
          </span>
        </div>

        {/* OCT Row */}
        <div 
          onClick={() => handleRadixChange('OCT')}
          className={`flex items-baseline justify-between p-2 rounded-xl cursor-pointer transition-all ${radix === 'OCT' ? 'bg-theme-accent/15 border border-theme-accent/50 text-theme-accent shadow-xs' : 'hover:bg-theme-elevated/50 border border-transparent text-theme-text-muted'}`}
        >
          <span className="font-mono text-xs font-bold w-10">OCT</span>
          <span className="font-mono text-base sm:text-lg font-bold select-text cursor-text text-right break-all">
            {octDisplay || '0'}
          </span>
        </div>

        {/* BIN Row */}
        <div 
          onClick={() => handleRadixChange('BIN')}
          className={`flex items-baseline justify-between p-2 rounded-xl cursor-pointer transition-all ${radix === 'BIN' ? 'bg-theme-accent/15 border border-theme-accent/50 text-theme-accent shadow-xs' : 'hover:bg-theme-elevated/50 border border-transparent text-theme-text-muted'}`}
        >
          <span className="font-mono text-xs font-bold w-10">BIN</span>
          <span className="font-mono text-xs sm:text-sm font-semibold select-text cursor-text text-right break-all tracking-wider">
            {binDisplay}
          </span>
        </div>
      </div>

      {/* Interactive 64-bit Bitboard Grid */}
      <div className="p-3.5 rounded-2xl bg-theme-card border border-theme-border/70 shadow-tactile flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-theme-text-dim px-1">
          <span className="font-semibold text-theme-text-muted">Interactive 64-Bit Bitboard</span>
          <span>Click any bit to toggle (0 ↔ 1)</span>
        </div>

        {/* Bitboard matrix rendered in 2 rows of 32 bits or 4 rows of 16 */}
        <div className="space-y-2 py-1">
          {/* Upper 32 bits (63 down to 32) */}
          <div className="space-y-0.5">
            <div className="flex justify-between text-[10px] font-mono text-theme-text-dim px-1">
              <span>63</span>
              <span>48</span>
              <span>47</span>
              <span>32</span>
            </div>
            <div 
              className="grid gap-0.5 sm:gap-1"
              style={{ gridTemplateColumns: 'repeat(32, minmax(0, 1fr))' }}
            >
              {allBits.slice(0, 32).map(idx => {
                const bitVal = getBit(value, idx);
                const isEnabledByWordSize = idx < activeBitsCount;
                const isNibbleBoundary = idx % 4 === 0 && idx !== 32;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isEnabledByWordSize}
                    onClick={() => handleBitClick(idx)}
                    title={`Bit ${idx}: ${bitVal}`}
                    className={`
                      h-6 sm:h-7 rounded flex items-center justify-center font-mono text-[9px] sm:text-xs font-bold transition-all
                      ${isNibbleBoundary ? 'mr-0.5' : ''}
                      ${!isEnabledByWordSize ? 'opacity-20 cursor-not-allowed bg-theme-bg' : bitVal === 1 ? 'bg-theme-accent text-white shadow-xs' : 'bg-theme-elevated text-theme-text-dim hover:bg-theme-btn-hover'}
                    `}
                  >
                    {bitVal}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lower 32 bits (31 down to 0) */}
          <div className="space-y-0.5 pt-1">
            <div className="flex justify-between text-[10px] font-mono text-theme-text-dim px-1">
              <span>31</span>
              <span>16</span>
              <span>15</span>
              <span>0</span>
            </div>
            <div 
              className="grid gap-0.5 sm:gap-1"
              style={{ gridTemplateColumns: 'repeat(32, minmax(0, 1fr))' }}
            >
              {allBits.slice(32, 64).map(idx => {
                const bitVal = getBit(value, idx);
                const isEnabledByWordSize = idx < activeBitsCount;
                const isNibbleBoundary = idx % 4 === 0 && idx !== 0;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={!isEnabledByWordSize}
                    onClick={() => handleBitClick(idx)}
                    title={`Bit ${idx}: ${bitVal}`}
                    className={`
                      h-6 sm:h-7 rounded flex items-center justify-center font-mono text-[9px] sm:text-xs font-bold transition-all
                      ${isNibbleBoundary ? 'mr-0.5' : ''}
                      ${!isEnabledByWordSize ? 'opacity-20 cursor-not-allowed bg-theme-bg' : bitVal === 1 ? 'bg-theme-accent text-white shadow-xs' : 'bg-theme-elevated text-theme-text-dim hover:bg-theme-btn-hover'}
                    `}
                  >
                    {bitVal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Programmer Keypad */}
      <div className="grid grid-cols-6 gap-2">
        {/* Bitwise Row 1 */}
        <KeypadButton
          label="AND"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleSelectOp('AND')}
        />
        <KeypadButton
          label="OR"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleSelectOp('OR')}
        />
        <KeypadButton
          label="XOR"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleSelectOp('XOR')}
        />
        <KeypadButton
          label="NOT"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleBitwiseNot}
        />
        <KeypadButton
          label="C"
          variant="danger"
          sound="clear"
          badge="Esc"
          heightClass="h-11 sm:h-12"
          onClick={handleClear}
        />
        <KeypadButton
          label={<Delete className="w-4 h-4 mx-auto" />}
          variant="fn"
          sound="clear"
          badge="⌫"
          heightClass="h-11 sm:h-12"
          onClick={handleBackspace}
        />

        {/* Bitwise Row 2 */}
        <KeypadButton
          label="NAND"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleSelectOp('NAND')}
        />
        <KeypadButton
          label="NOR"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleSelectOp('NOR')}
        />
        <KeypadButton
          label="LSH <<"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleSelectOp('LSH')}
        />
        <KeypadButton
          label="RSH >>"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={() => handleSelectOp('RSH')}
        />
        <KeypadButton
          label="ROL"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleRol}
        />
        <KeypadButton
          label="ROR"
          variant="fn"
          sound="operator"
          heightClass="h-11 sm:h-12"
          onClick={handleRor}
        />

        {/* Row 3: A, B, 7, 8, 9 */}
        <KeypadButton
          label="A"
          variant="digit"
          disabled={!isCharAllowedForRadix('A', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('A')}
        />
        <KeypadButton
          label="B"
          variant="digit"
          disabled={!isCharAllowedForRadix('B', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('B')}
        />
        <KeypadButton
          label="7"
          variant="digit"
          disabled={!isCharAllowedForRadix('7', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('7')}
        />
        <KeypadButton
          label="8"
          variant="digit"
          disabled={!isCharAllowedForRadix('8', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('8')}
        />
        <KeypadButton
          label="9"
          variant="digit"
          disabled={!isCharAllowedForRadix('9', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('9')}
        />
        <KeypadButton
          label="÷"
          variant="op"
          disabled={true}
          heightClass="h-11 sm:h-12"
          onClick={() => {}}
        />

        {/* Row 4: C, D, 4, 5, 6 */}
        <KeypadButton
          label="C"
          variant="digit"
          disabled={!isCharAllowedForRadix('C', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('C')}
        />
        <KeypadButton
          label="D"
          variant="digit"
          disabled={!isCharAllowedForRadix('D', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('D')}
        />
        <KeypadButton
          label="4"
          variant="digit"
          disabled={!isCharAllowedForRadix('4', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('4')}
        />
        <KeypadButton
          label="5"
          variant="digit"
          disabled={!isCharAllowedForRadix('5', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('5')}
        />
        <KeypadButton
          label="6"
          variant="digit"
          disabled={!isCharAllowedForRadix('6', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('6')}
        />
        <KeypadButton
          label="×"
          variant="op"
          disabled={true}
          heightClass="h-11 sm:h-12"
          onClick={() => {}}
        />

        {/* Row 5: E, F, 1, 2, 3 */}
        <KeypadButton
          label="E"
          variant="digit"
          disabled={!isCharAllowedForRadix('E', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('E')}
        />
        <KeypadButton
          label="F"
          variant="digit"
          disabled={!isCharAllowedForRadix('F', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('F')}
        />
        <KeypadButton
          label="1"
          variant="digit"
          disabled={!isCharAllowedForRadix('1', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('1')}
        />
        <KeypadButton
          label="2"
          variant="digit"
          disabled={!isCharAllowedForRadix('2', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('2')}
        />
        <KeypadButton
          label="3"
          variant="digit"
          disabled={!isCharAllowedForRadix('3', radix)}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('3')}
        />
        <KeypadButton
          label="−"
          variant="op"
          disabled={true}
          heightClass="h-11 sm:h-12"
          onClick={() => {}}
        />

        {/* Row 6: 0, =, etc. */}
        <KeypadButton
          label="0"
          variant="digit"
          disabled={!isCharAllowedForRadix('0', radix)}
          span={4}
          heightClass="h-11 sm:h-12"
          onClick={() => handleInputChar('0')}
        />
        <KeypadButton
          label="="
          variant="equal"
          sound="equals"
          span={2}
          badge="↵"
          heightClass="h-11 sm:h-12"
          onClick={handleEquals}
        />
      </div>
    </div>
  );
};
