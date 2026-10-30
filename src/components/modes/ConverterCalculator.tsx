import React, { useState } from 'react';
import { ConversionCategory } from '../../types/calculator';
import { 
  CONVERSION_CATEGORIES, 
  convertUnits, 
  getFormulaString 
} from '../../utils/conversions';
import { soundEngine } from '../../utils/soundEngine';
import { 
  ArrowLeftRight, 
  Layers, 
  Copy, 
  Check, 
  Info,
  Ruler,
  Scale,
  Thermometer,
  HardDrive,
  Gauge,
  Maximize2,
  Box,
  Clock,
  Coins
} from 'lucide-react';

interface ConverterCalculatorProps {
  onAddHistory: (expression: string, result: string, meta?: string) => void;
}

export const ConverterCalculator: React.FC<ConverterCalculatorProps> = ({
  onAddHistory,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<ConversionCategory>('length');
  const [fromValue, setFromValue] = useState<string>('1');
  const [fromUnitId, setFromUnitId] = useState<string>('km');
  const [toUnitId, setToUnitId] = useState<string>('mi');
  const [copiedMatrixUnit, setCopiedMatrixUnit] = useState<string | null>(null);

  const activeCategoryData = CONVERSION_CATEGORIES.find(c => c.id === selectedCategory)!;

  // Category switch
  const handleSelectCategory = (catId: ConversionCategory) => {
    soundEngine.play('toggle');
    setSelectedCategory(catId);
    const cat = CONVERSION_CATEGORIES.find(c => c.id === catId)!;
    setFromUnitId(cat.units[0].id);
    setToUnitId(cat.units[1]?.id || cat.units[0].id);
  };

  // Swap From and To units
  const handleSwapUnits = () => {
    soundEngine.play('operator');
    const oldFrom = fromUnitId;
    const oldTo = toUnitId;
    setFromUnitId(oldTo);
    setToUnitId(oldFrom);
  };

  // Bilateral calculation
  const numVal = parseFloat(fromValue) || 0;
  const convertedVal = convertUnits(numVal, selectedCategory, fromUnitId, toUnitId);
  const formulaStr = getFormulaString(selectedCategory, fromUnitId, toUnitId);

  const fromUnitObj = activeCategoryData.units.find(u => u.id === fromUnitId);
  const toUnitObj = activeCategoryData.units.find(u => u.id === toUnitId);

  const formatClean = (val: number) => {
    if (isNaN(val)) return '0';
    if (!isFinite(val)) return 'Infinity';
    if (Math.abs(val) < 1e-6 && val !== 0) return val.toExponential(4);
    if (Math.abs(val) >= 1e12) return val.toExponential(6);
    return val.toLocaleString(undefined, { maximumFractionDigits: 6 });
  };

  const categoryIcons: Record<ConversionCategory, React.ComponentType<{ className?: string }>> = {
    length: Ruler,
    mass: Scale,
    temperature: Thermometer,
    storage: HardDrive,
    speed: Gauge,
    area: Maximize2,
    volume: Box,
    time: Clock,
    currency: Coins,
  };

  const handleCopyValue = (valStr: string, unitKey: string) => {
    navigator.clipboard.writeText(valStr);
    soundEngine.play('toggle');
    setCopiedMatrixUnit(unitKey);
    setTimeout(() => setCopiedMatrixUnit(null), 1500);
  };

  const handleRecordToHistory = () => {
    soundEngine.play('equals');
    const expr = `${fromValue} ${fromUnitObj?.symbol || ''} → ${toUnitObj?.symbol || ''}`;
    const res = `${formatClean(convertedVal)} ${toUnitObj?.symbol || ''}`;
    onAddHistory(expr, res, `Convert · ${activeCategoryData.name}`);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* 9 Category Horizontal Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 rounded-2xl bg-theme-card border border-theme-border/70 scrollbar-none">
        {CONVERSION_CATEGORIES.map(cat => {
          const Icon = categoryIcons[cat.id];
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all
                ${isActive 
                  ? 'bg-theme-accent text-white shadow-xs font-semibold' 
                  : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated'}
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Bilateral Conversion Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile relative">
        {/* Swap Button in center for Desktop */}
        <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <button
            type="button"
            onClick={handleSwapUnits}
            title="Swap Source and Target Units"
            className="w-10 h-10 rounded-full bg-theme-elevated border border-theme-border text-theme-accent hover:bg-theme-accent hover:text-white transition-all shadow-md flex items-center justify-center hover:scale-110 active:scale-95"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* FROM Card */}
        <div className="p-4 rounded-xl bg-theme-elevated/40 border border-theme-border/60 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-theme-text-dim">
            <span>From ({activeCategoryData.name})</span>
            <span className="font-semibold text-theme-accent">{fromUnitObj?.symbol}</span>
          </div>

          <input
            type="number"
            value={fromValue}
            onChange={e => setFromValue(e.target.value)}
            className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-4 py-3 font-mono text-2xl font-bold text-theme-text focus:outline-none focus:border-theme-accent shadow-inner"
            placeholder="0"
          />

          <select
            value={fromUnitId}
            onChange={e => {
              soundEngine.play('toggle');
              setFromUnitId(e.target.value);
            }}
            className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3 py-2 text-xs font-mono text-theme-text focus:outline-none focus:border-theme-accent cursor-pointer"
          >
            {activeCategoryData.units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Mobile Swap Button */}
        <div className="flex md:hidden justify-center my--1">
          <button
            type="button"
            onClick={handleSwapUnits}
            className="p-2 rounded-full bg-theme-elevated border border-theme-border text-theme-accent shadow-sm"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* TO Card */}
        <div className="p-4 rounded-xl bg-theme-elevated/40 border border-theme-border/60 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-mono text-theme-text-dim">
            <span>Converted Result</span>
            <span className="font-semibold text-theme-accent">{toUnitObj?.symbol}</span>
          </div>

          <div className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-4 py-3 font-mono text-2xl font-bold text-theme-accent overflow-x-auto shadow-inner select-text">
            {formatClean(convertedVal)}
          </div>

          <select
            value={toUnitId}
            onChange={e => {
              soundEngine.play('toggle');
              setToUnitId(e.target.value);
            }}
            className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3 py-2 text-xs font-mono text-theme-text focus:outline-none focus:border-theme-accent cursor-pointer"
          >
            {activeCategoryData.units.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.symbol})
              </option>
            ))}
          </select>
        </div>

        {/* Bottom Banner: Formula & Record Button */}
        <div className="md:col-span-2 pt-2 border-t border-theme-border/40 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-theme-text-dim">
            <Info className="w-4 h-4 text-theme-accent shrink-0" />
            <span>Formula: <strong className="text-theme-text">{formulaStr}</strong></span>
          </div>

          <button
            type="button"
            onClick={handleRecordToHistory}
            className="px-3.5 py-1.5 rounded-lg bg-theme-accent/15 text-theme-accent border border-theme-accent/40 font-semibold hover:bg-theme-accent hover:text-white transition-all shadow-xs"
          >
            Record to Audit Tape
          </button>
        </div>
      </div>

      {/* Multi-unit Live Reference Matrix */}
      <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/70 shadow-tactile flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="font-semibold text-theme-text">
            Multi-Unit Live Matrix ({activeCategoryData.units.length} Units)
          </span>
          <span className="text-theme-text-dim">Calculated simultaneously</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {activeCategoryData.units.map(unit => {
            const matrixVal = convertUnits(numVal, selectedCategory, fromUnitId, unit.id);
            const isCurrentTarget = unit.id === toUnitId;
            const isCurrentSource = unit.id === fromUnitId;
            const formatted = formatClean(matrixVal);

            return (
              <div
                key={unit.id}
                className={`
                  p-3 rounded-xl border transition-all flex items-center justify-between gap-2
                  ${isCurrentTarget 
                    ? 'bg-theme-accent/10 border-theme-accent shadow-xs' 
                    : isCurrentSource 
                    ? 'bg-theme-elevated/70 border-theme-border-subtle' 
                    : 'bg-theme-elevated/30 border-theme-border/50 hover:border-theme-border'}
                `}
              >
                <div className="flex flex-col min-w-0">
                  <span className="text-[11px] font-mono text-theme-text-dim truncate">
                    {unit.name}
                  </span>
                  <span className="text-sm font-mono font-bold text-theme-text truncate select-text">
                    {formatted} <span className="text-xs text-theme-accent font-semibold">{unit.symbol}</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyValue(String(matrixVal), unit.id)}
                  title="Copy value"
                  className="p-1.5 rounded-lg bg-theme-bg border border-theme-border/60 text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated transition-colors shrink-0"
                >
                  {copiedMatrixUnit === unit.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
