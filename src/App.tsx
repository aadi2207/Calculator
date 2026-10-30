import React, { useState, useEffect } from 'react';
import { 
  CalculatorMode, 
  ThemeId 
} from './types/calculator';
import { Navbar, THEMES } from './components/Navbar';
import { HistoryTape } from './components/HistoryTape';
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal';
import { StandardCalculator } from './components/modes/StandardCalculator';
import { ScientificCalculator } from './components/modes/ScientificCalculator';
import { ProgrammerCalculator } from './components/modes/ProgrammerCalculator';
import { ConverterCalculator } from './components/modes/ConverterCalculator';
import { FinancialCalculator } from './components/modes/FinancialCalculator';
import { GraphingCalculator } from './components/modes/GraphingCalculator';
import { useCalculaHistory } from './hooks/useCalculaHistory';
import { soundEngine } from './utils/soundEngine';

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<CalculatorMode>('standard');
  const [activeTheme, setActiveTheme] = useState<ThemeId>(() => {
    try {
      const savedTheme = localStorage.getItem('calcula_theme') as ThemeId;
      if (['studio-dark', 'clean-light', 'amber-phosphor', 'nordic-slate'].includes(savedTheme)) {
        return savedTheme;
      }
    } catch {
      // ignore
    }
    return 'studio-dark';
  });

  const [isSoundMuted, setIsSoundMuted] = useState<boolean>(soundEngine.getMuted());
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState<boolean>(false);
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState<boolean>(false);

  // Incoming tape insertions
  const [incomingInsert, setIncomingInsert] = useState<string | null>(null);
  const [incomingExpression, setIncomingExpression] = useState<string | null>(null);

  // History & Memory hook
  const {
    history,
    addHistory,
    clearHistory,
    removeHistoryItem,
    exportAsCsv,
    memory,
    hasMemory,
    memoryClear,
    memoryRecall,
    memoryStore,
    memoryAdd,
    memorySubtract,
  } = useCalculaHistory();

  // Apply theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-studio-dark', 'theme-clean-light', 'theme-amber-phosphor', 'theme-nordic-slate');
    root.classList.add(`theme-${activeTheme}`);
    try {
      localStorage.setItem('calcula_theme', activeTheme);
    } catch {
      // ignore
    }
  }, [activeTheme]);

  // Cycle theme handler
  const handleCycleTheme = () => {
    soundEngine.play('toggle');
    const themeIds: ThemeId[] = ['studio-dark', 'clean-light', 'amber-phosphor', 'nordic-slate'];
    const nextIdx = (themeIds.indexOf(activeTheme) + 1) % themeIds.length;
    setActiveTheme(themeIds[nextIdx]);
  };

  // Toggle sound handler
  const handleToggleSound = () => {
    const muted = soundEngine.toggleMute();
    setIsSoundMuted(muted);
  };

  // Global hotkeys (M, T, ?, 1-6)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if focus is inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === 'm') {
        e.preventDefault();
        handleToggleSound();
      } else if (key === 't') {
        e.preventDefault();
        handleCycleTheme();
      } else if (e.key === '?') {
        e.preventDefault();
        soundEngine.play('toggle');
        setShortcutsModalOpen(prev => !prev);
      } else if (e.key === '1') {
        setActiveMode('standard');
      } else if (e.key === '2') {
        setActiveMode('scientific');
      } else if (e.key === '3') {
        setActiveMode('programmer');
      } else if (e.key === '4') {
        setActiveMode('converter');
      } else if (e.key === '5') {
        setActiveMode('financial');
      } else if (e.key === '6') {
        setActiveMode('graphing');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTheme, activeMode]);

  // Handle insert from history tape
  const handleInsertResult = (val: string) => {
    setIncomingInsert(val);
  };

  const handleRestoreExpression = (expr: string) => {
    setIncomingExpression(expr);
  };

  const handleClearIncoming = () => {
    setIncomingInsert(null);
    setIncomingExpression(null);
  };

  return (
    <div className={`min-h-screen bg-theme-bg text-theme-text font-sans flex flex-col transition-colors duration-200 theme-${activeTheme}`}>
      {/* Top 3-Zone Navigation Bar */}
      <Navbar
        activeMode={activeMode}
        onSelectMode={setActiveMode}
        activeTheme={activeTheme}
        onCycleTheme={handleCycleTheme}
        isSoundMuted={isSoundMuted}
        onToggleSound={handleToggleSound}
        onOpenShortcuts={() => setShortcutsModalOpen(true)}
        historyOpen={mobileHistoryOpen}
        onToggleHistory={() => setMobileHistoryOpen(!mobileHistoryOpen)}
      />

      {/* Main 2-Column Console Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left/Center Column: Active Calculator (8 cols on desktop) */}
        <div className="lg:col-span-8 w-full flex flex-col items-center justify-center">
          {activeMode === 'standard' && (
            <StandardCalculator
              onAddHistory={(expr, res) => addHistory('standard', expr, res)}
              memory={memory}
              hasMemory={hasMemory}
              onMemoryStore={memoryStore}
              onMemoryClear={memoryClear}
              onMemoryRecall={memoryRecall}
              onMemoryAdd={memoryAdd}
              onMemorySubtract={memorySubtract}
              incomingInsert={incomingInsert}
              incomingExpression={incomingExpression}
              onClearIncoming={handleClearIncoming}
            />
          )}

          {activeMode === 'scientific' && (
            <ScientificCalculator
              onAddHistory={(expr, res, meta) => addHistory('scientific', expr, res, meta)}
              memory={memory}
              hasMemory={hasMemory}
              onMemoryStore={memoryStore}
              onMemoryClear={memoryClear}
              onMemoryRecall={memoryRecall}
              onMemoryAdd={memoryAdd}
              onMemorySubtract={memorySubtract}
              incomingInsert={incomingInsert}
              incomingExpression={incomingExpression}
              onClearIncoming={handleClearIncoming}
            />
          )}

          {activeMode === 'programmer' && (
            <ProgrammerCalculator
              onAddHistory={(expr, res, meta) => addHistory('programmer', expr, res, meta)}
              incomingInsert={incomingInsert}
              onClearIncoming={handleClearIncoming}
            />
          )}

          {activeMode === 'converter' && (
            <ConverterCalculator
              onAddHistory={(expr, res, meta) => addHistory('converter', expr, res, meta)}
            />
          )}

          {activeMode === 'financial' && (
            <FinancialCalculator
              onAddHistory={(expr, res, meta) => addHistory('financial', expr, res, meta)}
            />
          )}

          {activeMode === 'graphing' && (
            <GraphingCalculator
              onAddHistory={(expr, res, meta) => addHistory('graphing', expr, res, meta)}
            />
          )}
        </div>

        {/* Right Column: Live Calculation History Tape & Memory Panel (4 cols on desktop) */}
        <div className="hidden lg:block lg:col-span-4 sticky top-20 h-[calc(100vh-6.5rem)]">
          <HistoryTape
            history={history}
            onInsertResult={handleInsertResult}
            onRestoreExpression={handleRestoreExpression}
            onClearHistory={clearHistory}
            onExportCsv={exportAsCsv}
            onRemoveItem={removeHistoryItem}
            memory={memory}
            hasMemory={hasMemory}
            onMemoryClear={memoryClear}
            onMemoryRecall={memoryRecall}
          />
        </div>
      </main>

      {/* Mobile Slide-over Drawer for History Tape */}
      {mobileHistoryOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex justify-end bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm h-full p-3 animate-in slide-in-from-right duration-200">
            <HistoryTape
              history={history}
              onInsertResult={val => {
                handleInsertResult(val);
                setMobileHistoryOpen(false);
              }}
              onRestoreExpression={expr => {
                handleRestoreExpression(expr);
                setMobileHistoryOpen(false);
              }}
              onClearHistory={clearHistory}
              onExportCsv={exportAsCsv}
              onRemoveItem={removeHistoryItem}
              memory={memory}
              hasMemory={hasMemory}
              onMemoryClear={memoryClear}
              onMemoryRecall={memoryRecall}
              onCloseMobile={() => setMobileHistoryOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Overlay Modal */}
      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />
    </div>
  );
};

export default App;
