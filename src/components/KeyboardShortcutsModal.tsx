import React from 'react';
import { X, Command, Keyboard } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const sections = [
    {
      title: 'Global Controls',
      items: [
        { keys: ['M'], desc: 'Toggle Mechanical Sound Engine' },
        { keys: ['T'], desc: 'Cycle Color Themes (4 themes)' },
        { keys: ['?'], desc: 'Open / Close Shortcuts Guide' },
        { keys: ['1', '-', '6'], desc: 'Quick switch modes (Standard, Sci, Prog...)' },
      ],
    },
    {
      title: 'Calculation & Keypad',
      items: [
        { keys: ['0', '—', '9'], desc: 'Enter numbers' },
        { keys: ['+', '−', '*', '/'], desc: 'Arithmetic operations' },
        { keys: ['Enter', 'or', '='], desc: 'Evaluate expression' },
        { keys: ['Backspace'], desc: 'Delete last character' },
        { keys: ['Escape', 'or', 'C'], desc: 'Clear All (AC)' },
        { keys: ['(', ')'], desc: 'Group with parentheses' },
        { keys: ['%'], desc: 'Percentage / Modulo' },
      ],
    },
    {
      title: 'Programmer Mode',
      items: [
        { keys: ['A', '—', 'F'], desc: 'Hexadecimal digits (HEX mode)' },
        { keys: ['Tab'], desc: 'Cycle Active Radix (HEX, DEC, OCT, BIN)' },
        { keys: ['Click Bit'], desc: 'Toggle bit in 64-bit Bitboard' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-theme-card border border-theme-border rounded-2xl shadow-2xl overflow-hidden p-6 text-theme-text">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-theme-border/60">
          <div className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-theme-accent" />
            <h3 className="font-mono font-bold text-base sm:text-lg">Keyboard Shortcuts Guide</h3>
          </div>
          <button
            type="button"
            onClick={() => {
              soundEngine.play('clear');
              onClose();
            }}
            className="p-1 rounded-lg text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {sections.map(section => (
            <div key={section.title}>
              <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-theme-text-dim mb-2.5">
                {section.title}
              </h4>
              <div className="space-y-2">
                {section.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-theme-elevated/40 border border-theme-border/30 text-xs"
                  >
                    <span className="text-theme-text-muted">{item.desc}</span>
                    <div className="flex items-center gap-1">
                      {item.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="px-2 py-0.5 rounded bg-theme-bg border border-theme-border text-theme-text font-mono font-medium shadow-xs text-[11px]"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-theme-border/60 flex items-center justify-between text-xs text-theme-text-dim font-mono">
          <span>Physical keyboard listening active</span>
          <button
            type="button"
            onClick={() => {
              soundEngine.play('toggle');
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-theme-accent text-white font-semibold hover:bg-theme-accent/90 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
