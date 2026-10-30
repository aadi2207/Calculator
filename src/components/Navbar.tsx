import React from 'react';
import { 
  CalculatorMode, 
  ThemeId, 
  ThemeConfig 
} from '../types/calculator';
import { 
  Volume2, 
  VolumeX, 
  Palette, 
  HelpCircle, 
  History, 
  Binary, 
  FlaskConical, 
  ArrowLeftRight, 
  Landmark, 
  LineChart, 
  Calculator 
} from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

export const THEMES: ThemeConfig[] = [
  { id: 'studio-dark', name: 'Studio Dark', badge: 'Dark', previewBg: '#0d0f12', previewAccent: '#3b82f6' },
  { id: 'clean-light', name: 'Clean Light', badge: 'Light', previewBg: '#f8fafc', previewAccent: '#2563eb' },
  { id: 'amber-phosphor', name: 'Amber Phosphor', badge: 'Amber', previewBg: '#0a0907', previewAccent: '#f59e0b' },
  { id: 'nordic-slate', name: 'Nordic Slate', badge: 'Slate', previewBg: '#0b1120', previewAccent: '#38bdf8' },
];

interface NavbarProps {
  activeMode: CalculatorMode;
  onSelectMode: (mode: CalculatorMode) => void;
  activeTheme: ThemeId;
  onCycleTheme: () => void;
  isSoundMuted: boolean;
  onToggleSound: () => void;
  onOpenShortcuts: () => void;
  historyOpen: boolean;
  onToggleHistory: () => void;
}

const MODES: { id: CalculatorMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'standard', label: 'Standard', icon: Calculator },
  { id: 'scientific', label: 'Scientific', icon: FlaskConical },
  { id: 'programmer', label: 'Programmer', icon: Binary },
  { id: 'converter', label: 'Converter', icon: ArrowLeftRight },
  { id: 'financial', label: 'Financial', icon: Landmark },
  { id: 'graphing', label: 'Graphing', icon: LineChart },
];

export const Navbar: React.FC<NavbarProps> = ({
  activeMode,
  onSelectMode,
  activeTheme,
  onCycleTheme,
  isSoundMuted,
  onToggleSound,
  onOpenShortcuts,
  historyOpen,
  onToggleHistory,
}) => {
  const currentThemeConfig = THEMES.find(t => t.id === activeTheme) || THEMES[0];

  return (
    <header className="sticky top-0 z-30 w-full border-b border-theme-border/70 bg-theme-bg/90 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Zone: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-theme-primary/15 border border-theme-primary/30 flex items-center justify-center text-theme-primary font-mono font-black text-lg shadow-sm">
              C
            </div>
            <div>
              <span className="font-mono font-bold tracking-tight text-lg sm:text-xl text-theme-text flex items-center gap-1.5">
                Calcula
                <span className="hidden sm:inline-block text-[10px] font-sans font-medium px-1.5 py-0.5 rounded border border-theme-primary/40 bg-theme-primary/10 text-theme-primary">
                  PRO
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Center Zone: Single-line Mode Switcher Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto py-1 px-1 rounded-xl bg-theme-card border border-theme-border/60 shadow-inner scrollbar-none max-w-full">
          {MODES.map(mode => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => {
                  soundEngine.play('toggle');
                  onSelectMode(mode.id);
                }}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? 'bg-theme-elevated text-theme-accent shadow-sm border border-theme-border font-semibold' 
                    : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated/50 border border-transparent'}
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-theme-accent' : 'text-theme-text-dim'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Zone: Quick Utilities */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Sound Toggle [M] */}
          <button
            type="button"
            onClick={onToggleSound}
            title={isSoundMuted ? 'Sound Muted (Press M)' : 'Tactile Mechanical Sound ON (Press M)'}
            className={`
              p-2 rounded-lg border transition-all text-xs font-mono flex items-center gap-1
              ${isSoundMuted 
                ? 'border-theme-border text-theme-text-dim bg-theme-card hover:bg-theme-elevated' 
                : 'border-theme-accent/40 text-theme-accent bg-theme-accent/10 hover:bg-theme-accent/20'}
            `}
          >
            {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span className="hidden md:inline text-[10px] text-theme-text-dim font-bold">[M]</span>
          </button>

          {/* Theme Switcher [T] */}
          <button
            type="button"
            onClick={onCycleTheme}
            title={`Current Theme: ${currentThemeConfig.name} (Press T to switch)`}
            className="p-2 rounded-lg border border-theme-border bg-theme-card hover:bg-theme-elevated text-theme-text-muted hover:text-theme-text transition-all text-xs font-mono flex items-center gap-1.5"
          >
            <div 
              className="w-3.5 h-3.5 rounded-full border border-theme-border shadow-sm shrink-0" 
              style={{ backgroundColor: currentThemeConfig.previewAccent }}
            />
            <span className="hidden lg:inline text-xs font-medium">{currentThemeConfig.badge}</span>
            <span className="hidden md:inline text-[10px] text-theme-text-dim font-bold">[T]</span>
          </button>

          {/* Keyboard Shortcuts [?] */}
          <button
            type="button"
            onClick={onOpenShortcuts}
            title="Keyboard Shortcuts Guide (Press ?)"
            className="p-2 rounded-lg border border-theme-border bg-theme-card hover:bg-theme-elevated text-theme-text-muted hover:text-theme-text transition-all text-xs font-mono"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Mobile History Drawer Toggle */}
          <button
            type="button"
            onClick={onToggleHistory}
            title="Toggle Calculation Tape"
            className={`
              lg:hidden p-2 rounded-lg border transition-all text-xs font-mono
              ${historyOpen 
                ? 'border-theme-accent text-theme-accent bg-theme-accent/10' 
                : 'border-theme-border text-theme-text-muted hover:text-theme-text bg-theme-card'}
            `}
          >
            <History className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
