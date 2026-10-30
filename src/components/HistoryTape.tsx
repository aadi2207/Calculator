import React, { useState } from 'react';
import { HistoryItem, CalculatorMode } from '../types/calculator';
import { 
  Download, 
  Trash2, 
  Copy, 
  Check, 
  CornerDownLeft, 
  RotateCcw, 
  Cpu, 
  Clock, 
  X,
  FileSpreadsheet
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface HistoryTapeProps {
  history: HistoryItem[];
  onInsertResult: (val: string) => void;
  onRestoreExpression: (expr: string) => void;
  onClearHistory: () => void;
  onExportCsv: () => void;
  onRemoveItem: (id: string) => void;
  memory: number;
  hasMemory: boolean;
  onMemoryClear: () => void;
  onMemoryRecall: () => void;
  onCloseMobile?: () => void;
}

export const HistoryTape: React.FC<HistoryTapeProps> = ({
  history,
  onInsertResult,
  onRestoreExpression,
  onClearHistory,
  onExportCsv,
  onRemoveItem,
  memory,
  hasMemory,
  onMemoryClear,
  onMemoryRecall,
  onCloseMobile,
}) => {
  const [activeTab, setActiveTab] = useState<'tape' | 'memory'>('tape');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    soundEngine.play('toggle');
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 1500);
  };

  const formatTimestamp = (ts: number, mode: CalculatorMode) => {
    const d = new Date(ts);
    const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const capitalizedMode = mode.charAt(0).toUpperCase() + mode.slice(1);
    return `${timeStr} · ${capitalizedMode}`;
  };

  return (
    <aside className="h-full flex flex-col bg-theme-card border border-theme-border/70 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm">
      {/* Header Tabs & Utilities */}
      <div className="p-3 border-b border-theme-border/60 bg-theme-elevated/40 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 bg-theme-bg/60 p-0.5 rounded-lg border border-theme-border/50">
          <button
            type="button"
            onClick={() => {
              soundEngine.play('toggle');
              setActiveTab('tape');
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all
              ${activeTab === 'tape' 
                ? 'bg-theme-elevated text-theme-accent shadow-xs font-semibold' 
                : 'text-theme-text-muted hover:text-theme-text'}
            `}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Audit Tape ({history.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.play('toggle');
              setActiveTab('memory');
            }}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono transition-all relative
              ${activeTab === 'memory' 
                ? 'bg-theme-elevated text-theme-accent shadow-xs font-semibold' 
                : 'text-theme-text-muted hover:text-theme-text'}
            `}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Memory</span>
            {hasMemory && (
              <span className="w-1.5 h-1.5 rounded-full bg-theme-accent inline-block animate-pulse" />
            )}
          </button>
        </div>

        <div className="flex items-center gap-1">
          {activeTab === 'tape' && history.length > 0 && (
            <>
              <button
                type="button"
                onClick={() => {
                  soundEngine.play('toggle');
                  onExportCsv();
                }}
                title="Export Tape as CSV"
                className="p-1.5 rounded-lg border border-theme-border/60 text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated transition-colors text-xs"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  soundEngine.play('clear');
                  onClearHistory();
                }}
                title="Clear History Tape"
                className="p-1.5 rounded-lg border border-theme-border/60 text-theme-danger hover:bg-theme-danger/10 transition-colors text-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Close for mobile drawer */}
          {onCloseMobile && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-lg border border-theme-border/60 text-theme-text-muted hover:text-theme-text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'tape' ? (
          history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-theme-text-dim">
              <Clock className="w-10 h-10 stroke-[1.5] mb-2 opacity-40" />
              <p className="text-sm font-medium">Audit tape is empty</p>
              <p className="text-xs mt-1">Calculations and expression evaluations will record here automatically.</p>
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className="group relative p-3 rounded-xl bg-theme-elevated/40 border border-theme-border/50 hover:border-theme-accent/40 transition-all hover:shadow-sm"
              >
                {/* Header metadata */}
                <div className="flex items-center justify-between text-[11px] font-mono text-theme-text-dim pb-1 mb-1 border-b border-theme-border/30">
                  <span>{formatTimestamp(item.timestamp, item.mode)}</span>
                  {item.meta && (
                    <span className="text-[10px] bg-theme-bg/60 px-1.5 py-0.5 rounded border border-theme-border/40 text-theme-text-muted">
                      {item.meta}
                    </span>
                  )}
                </div>

                {/* Expression */}
                <div className="font-mono text-xs text-theme-text-muted break-all text-right select-text cursor-text">
                  {item.expression} =
                </div>

                {/* Result */}
                <div className="font-mono text-lg font-bold text-theme-accent text-right break-all select-text cursor-text mt-0.5">
                  {item.result}
                </div>

                {/* Quick actions hover toolbar */}
                <div className="mt-2 pt-2 border-t border-theme-border/30 flex items-center justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.play('digit');
                      onInsertResult(item.result);
                    }}
                    title="Insert result into active calculation"
                    className="flex items-center gap-1 text-[11px] font-mono text-theme-text-muted hover:text-theme-accent bg-theme-bg/80 px-2 py-0.5 rounded border border-theme-border/50 hover:border-theme-accent/50 transition-colors"
                  >
                    <CornerDownLeft className="w-3 h-3" />
                    <span>Insert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.play('digit');
                      onRestoreExpression(item.expression);
                    }}
                    title="Restore expression"
                    className="flex items-center gap-1 text-[11px] font-mono text-theme-text-muted hover:text-theme-accent bg-theme-bg/80 px-2 py-0.5 rounded border border-theme-border/50 hover:border-theme-accent/50 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(item.result, item.id)}
                    title="Copy result"
                    className="p-1 rounded bg-theme-bg/80 text-theme-text-muted hover:text-theme-text border border-theme-border/50 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      soundEngine.play('clear');
                      onRemoveItem(item.id);
                    }}
                    title="Remove item"
                    className="p-1 rounded bg-theme-bg/80 text-theme-text-dim hover:text-red-400 border border-theme-border/50 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          /* Memory Tab */
          <div className="space-y-4 p-2">
            <div className="p-4 rounded-xl bg-theme-elevated border border-theme-border flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-mono text-theme-text-muted">
                <span>Active Register [M]</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${hasMemory ? 'bg-theme-accent/20 text-theme-accent border border-theme-accent/30' : 'bg-theme-bg text-theme-text-dim'}`}>
                  {hasMemory ? 'OCCUPIED' : 'EMPTY'}
                </span>
              </div>
              <div className="text-2xl font-mono font-bold text-theme-text tabular-nums select-text">
                {memory}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={!hasMemory}
                onClick={() => {
                  soundEngine.play('digit');
                  onMemoryRecall();
                }}
                className="p-2.5 rounded-xl border border-theme-border bg-theme-elevated/70 hover:bg-theme-elevated text-xs font-mono font-medium disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>MR (Recall)</span>
              </button>
              <button
                type="button"
                disabled={!hasMemory}
                onClick={() => {
                  soundEngine.play('clear');
                  onMemoryClear();
                }}
                className="p-2.5 rounded-xl border border-theme-border bg-theme-elevated/70 hover:bg-theme-danger/20 text-theme-danger hover:border-theme-danger/50 text-xs font-mono font-medium disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>MC (Clear)</span>
              </button>
            </div>

            <div className="text-xs text-theme-text-dim leading-relaxed p-2 font-mono">
              <p className="font-semibold text-theme-text-muted mb-1">Standard Memory Keys:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong className="text-theme-text">MS</strong>: Store current display into M</li>
                <li><strong className="text-theme-text">MR</strong>: Recall value from M</li>
                <li><strong className="text-theme-text">M+</strong>: Add display to M</li>
                <li><strong className="text-theme-text">M-</strong>: Subtract display from M</li>
                <li><strong className="text-theme-text">MC</strong>: Clear register M to 0</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer Tape Status */}
      <div className="p-2.5 border-t border-theme-border/60 bg-theme-elevated/30 text-[11px] font-mono text-theme-text-dim flex items-center justify-between">
        <span className="flex items-center gap-1">
          <FileSpreadsheet className="w-3.5 h-3.5 text-theme-text-dim" />
          <span>Local Audit Persistence</span>
        </span>
        <span>Auto-synced</span>
      </div>
    </aside>
  );
};
