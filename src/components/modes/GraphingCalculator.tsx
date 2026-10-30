import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ExpressionParser } from '../../utils/mathEvaluator';
import { soundEngine } from '../../utils/soundEngine';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid, 
  Crosshair, 
  Sparkles,
  HelpCircle,
  Plus
} from 'lucide-react';

interface GraphingCalculatorProps {
  onAddHistory: (expression: string, result: string, meta?: string) => void;
}

interface Preset {
  name: string;
  fn: string;
  desc?: string;
}

const PRESETS: Preset[] = [
  { name: 'sin(x) · x', fn: 'sin(x) * x', desc: 'Oscillating envelope' },
  { name: 'Cubic x³ − 3x', fn: 'x^3 - 3*x', desc: 'Local inflection' },
  { name: 'Gaussian e^(−x²)', fn: 'exp(-x^2)', desc: 'Standard bell curve' },
  { name: 'Rational 1/x', fn: '1/x', desc: 'Hyperbola' },
  { name: 'Damped Sine', fn: 'exp(-x/4) * sin(3*x)', desc: 'Decaying wave' },
  { name: 'Parabola x² − 4', fn: 'x^2 - 4', desc: 'Quadratic roots' },
];

export const GraphingCalculator: React.FC<GraphingCalculatorProps> = ({
  onAddHistory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Function expressions
  const [func1, setFunc1] = useState<string>('sin(x) * x');
  const [func2, setFunc2] = useState<string>('');
  const [showFunc2, setShowFunc2] = useState<boolean>(false);

  // Viewport transform
  const [scale, setScale] = useState<number>(36); // pixels per Cartesian unit
  const [originOffset, setOriginOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Mouse HUD crosshair
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Evaluate f(x) safely
  const evaluateFx = (exprStr: string, xVal: number, parser: ExpressionParser): number => {
    if (!exprStr.trim()) return NaN;
    try {
      // Replace standalone 'x' with actual numeric value
      // Regex matches word boundary 'x' or 'X'
      const substituted = exprStr.replace(/\bx\b/gi, `(${xVal})`);
      return parser.evaluate(substituted);
    } catch {
      return NaN;
    }
  };

  // Render Canvas
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear background
    ctx.fillStyle = '#090c10';
    ctx.fillRect(0, 0, width, height);

    const originX = width / 2 + originOffset.x;
    const originY = height / 2 + originOffset.y;

    // Draw Grid & Axes
    if (showGrid) {
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#1b2330';
      ctx.fillStyle = '#64748b';
      ctx.font = '10px "JetBrains Mono", monospace';

      // Determine clean grid step (e.g., 1, 2, 5, 10 units)
      let unitStep = 1;
      if (scale < 15) unitStep = 5;
      if (scale < 7) unitStep = 10;
      if (scale > 80) unitStep = 0.5;

      const pixelStep = unitStep * scale;

      // Vertical grid lines
      const startX = (originX % pixelStep) - pixelStep;
      for (let x = startX; x < width + pixelStep; x += pixelStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();

        const unitVal = (x - originX) / scale;
        if (Math.abs(unitVal) > 0.001) {
          ctx.fillText(unitVal.toFixed(unitStep < 1 ? 1 : 0), x + 3, originY + 12);
        }
      }

      // Horizontal grid lines
      const startY = (originY % pixelStep) - pixelStep;
      for (let y = startY; y < height + pixelStep; y += pixelStep) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        const unitVal = (originY - y) / scale;
        if (Math.abs(unitVal) > 0.001) {
          ctx.fillText(unitVal.toFixed(unitStep < 1 ? 1 : 0), originX + 4, y - 3);
        }
      }
    }

    // Main Axes X and Y
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#475569';
    // X Axis
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    // Y Axis
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();

    // Plot Function 1 (Primary Cyan/Accent)
    const parser = new ExpressionParser('RAD'); // RAD standard for calculus/geometry

    const plotCurve = (expr: string, strokeColor: string) => {
      if (!expr.trim()) return;

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();

      let isDrawing = false;
      const stepPixels = 1.5; // High resolution sampling

      for (let px = 0; px <= width; px += stepPixels) {
        const xVal = (px - originX) / scale;
        const yVal = evaluateFx(expr, xVal, parser);

        if (isNaN(yVal) || !isFinite(yVal)) {
          isDrawing = false;
          continue;
        }

        const py = originY - yVal * scale;

        // Clip huge vertical jumps (e.g. asymptotes like 1/x or tan(x))
        if (py < -height * 2 || py > height * 3) {
          isDrawing = false;
          continue;
        }

        if (!isDrawing) {
          ctx.moveTo(px, py);
          isDrawing = true;
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();
    };

    plotCurve(func1, '#38bdf8'); // Primary cyan/blue
    if (showFunc2 && func2.trim()) {
      plotCurve(func2, '#f59e0b'); // Secondary amber
    }

    // Crosshair Probe & Telemetry HUD
    if (mousePos) {
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, height);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(width, mousePos.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Point marker on f1(x)
      const mouseUnitX = (mousePos.x - originX) / scale;
      const f1Y = evaluateFx(func1, mouseUnitX, parser);
      if (!isNaN(f1Y) && isFinite(f1Y)) {
        const f1Py = originY - f1Y * scale;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(mousePos.x, f1Py, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
      }
    }

    ctx.restore();
  }, [func1, func2, showFunc2, scale, originOffset, showGrid, mousePos]);

  useEffect(() => {
    drawGraph();
  }, [drawGraph]);

  // Window resize listener
  useEffect(() => {
    const handleResize = () => drawGraph();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [drawGraph]);

  // Mouse Drag / Pan Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - originOffset.x, y: e.clientY - originOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    setMousePos({ x: currentX, y: currentY });

    if (isDragging) {
      setOriginOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleMouseLeave = () => {
    setIsDragging(false);
    setMousePos(null);
  };

  // Zoom controls
  const handleZoom = (factor: number) => {
    soundEngine.play('toggle');
    setScale(prev => Math.max(5, Math.min(300, prev * factor)));
  };

  const handleResetView = () => {
    soundEngine.play('clear');
    setScale(36);
    setOriginOffset({ x: 0, y: 0 });
  };

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setScale(prev => Math.max(5, Math.min(300, prev * factor)));
  };

  // Calculate probe coordinates for HUD
  let hudX = 0;
  let hudY = 0;
  let hudF1Y: number | null = null;
  if (mousePos && canvasRef.current) {
    const rect = canvasRef.current.getBoundingClientRect();
    const originX = rect.width / 2 + originOffset.x;
    const originY = rect.height / 2 + originOffset.y;
    hudX = (mousePos.x - originX) / scale;
    hudY = (originY - mousePos.y) / scale;
    try {
      const parser = new ExpressionParser('RAD');
      hudF1Y = evaluateFx(func1, hudX, parser);
    } catch {
      hudF1Y = null;
    }
  }

  const handleSelectPreset = (p: Preset) => {
    soundEngine.play('digit');
    setFunc1(p.fn);
  };

  const handleRecordGraph = () => {
    soundEngine.play('equals');
    onAddHistory(`f(x) = ${func1}`, `Plot at scale 1:${scale.toFixed(0)}`, 'Graphing 2D');
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-3">
      {/* Expression Control Inputs */}
      <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <span className="text-xs font-mono text-theme-text-dim flex items-center gap-1 mr-1">
              <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
              <span>Presets:</span>
            </span>
            {PRESETS.map(p => (
              <button
                key={p.name}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className="px-2.5 py-1 rounded-lg text-xs font-mono bg-theme-elevated/70 hover:bg-theme-elevated text-theme-text-muted hover:text-theme-text border border-theme-border/50 transition-colors whitespace-nowrap"
              >
                {p.name}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRecordGraph}
            className="px-3 py-1 rounded-lg bg-theme-accent/15 text-theme-accent border border-theme-accent/40 font-mono text-xs font-semibold hover:bg-theme-accent hover:text-white transition-colors"
          >
            Record Function
          </button>
        </div>

        {/* Function Inputs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* f1(x) */}
          <div className="w-full flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-sky-400 shrink-0">f₁(x) =</span>
            <input
              type="text"
              value={func1}
              onChange={e => setFunc1(e.target.value)}
              placeholder="e.g. sin(x) * x"
              className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3.5 py-2 font-mono text-sm font-semibold text-theme-text focus:outline-none focus:border-sky-400 shadow-inner"
            />
          </div>

          {/* Toggle f2(x) */}
          {!showFunc2 ? (
            <button
              type="button"
              onClick={() => {
                soundEngine.play('toggle');
                setShowFunc2(true);
                if (!func2) setFunc2('cos(x)');
              }}
              className="px-3 py-2 rounded-xl border border-theme-border text-xs font-mono text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated transition-colors flex items-center gap-1 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compare f₂(x)</span>
            </button>
          ) : (
            <div className="w-full flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400 shrink-0">f₂(x) =</span>
              <input
                type="text"
                value={func2}
                onChange={e => setFunc2(e.target.value)}
                placeholder="e.g. cos(x)"
                className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3.5 py-2 font-mono text-sm font-semibold text-theme-text focus:outline-none focus:border-amber-400 shadow-inner"
              />
              <button
                type="button"
                onClick={() => {
                  soundEngine.play('clear');
                  setShowFunc2(false);
                }}
                className="text-xs font-mono text-theme-text-dim hover:text-theme-danger px-1.5 py-1"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Plotter Stage */}
      <div className="relative rounded-2xl bg-[#090c10] border border-theme-border/80 shadow-tactile overflow-hidden h-[440px] sm:h-[480px]">
        {/* Floating Telemetry HUD (Live Crosshair Probe) */}
        <div className="absolute top-3 left-3 z-10 p-2.5 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 font-mono text-xs text-slate-200 shadow-lg flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-sky-400" />
            <span className="font-bold text-[11px] text-slate-400">TELEMETRY PROBE</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span>X: <strong className="text-slate-100">{hudX.toFixed(3)}</strong></span>
            <span>Y: <strong className="text-slate-100">{hudY.toFixed(3)}</strong></span>
            {hudF1Y !== null && !isNaN(hudF1Y) && (
              <span>f₁(x): <strong className="text-sky-400">{hudF1Y.toFixed(3)}</strong></span>
            )}
          </div>
        </div>

        {/* View Controls Toolbar (Top Right) */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/60 shadow-lg">
          <button
            type="button"
            onClick={() => handleZoom(1.25)}
            title="Zoom In"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(0.8)}
            title="Zoom Out"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleResetView}
            title="Reset Pan & Zoom"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.play('toggle');
              setShowGrid(!showGrid);
            }}
            title="Toggle Cartesian Grid"
            className={`p-1.5 rounded-lg transition-colors ${showGrid ? 'text-sky-400 bg-sky-500/20' : 'text-slate-400 hover:text-white'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>

        {/* Instructions pill (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
          Click & drag to pan · Scroll to zoom
        </div>

        {/* 2D Canvas */}
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          className="w-full h-full cursor-crosshair touch-none"
        />
      </div>
    </div>
  );
};
