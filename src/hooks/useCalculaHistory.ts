// Hook for calculation history tape persistence & memory registers

import { useState, useEffect } from 'react';
import { HistoryItem, CalculatorMode } from '../types/calculator';

const STORAGE_KEY = 'calcula_history_tape';
const MEMORY_STORAGE_KEY = 'calcula_memory_register';

export function useCalculaHistory() {
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [
      {
        id: 'init-1',
        timestamp: Date.now() - 3600000,
        mode: 'standard',
        expression: '128 × 1.25 + 40',
        result: '200',
        meta: 'Initial Audit'
      }
    ];
  });

  const [memory, setMemory] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(MEMORY_STORAGE_KEY);
      if (saved !== null) {
        return parseFloat(saved) || 0;
      }
    } catch {
      // ignore
    }
    return 0;
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(0, 100)));
    } catch {
      // ignore
    }
  }, [history]);

  // Save memory to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(MEMORY_STORAGE_KEY, String(memory));
    } catch {
      // ignore
    }
  }, [memory]);

  const addHistory = (mode: CalculatorMode, expression: string, result: string, meta?: string) => {
    const newItem: HistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      mode,
      expression,
      result,
      meta,
    };
    setHistory(prev => [newItem, ...prev.slice(0, 99)]);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const removeHistoryItem = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const exportAsCsv = () => {
    if (history.length === 0) return;
    const headers = ['Timestamp', 'Date/Time', 'Mode', 'Expression', 'Result', 'Metadata'];
    const rows = history.map(item => {
      const d = new Date(item.timestamp).toISOString();
      return [
        item.timestamp,
        `"${d}"`,
        `"${item.mode}"`,
        `"${item.expression.replace(/"/g, '""')}"`,
        `"${item.result.replace(/"/g, '""')}"`,
        `"${item.meta || ''}"`
      ].join(',');
    });
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `calcula_tape_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Memory functions
  const memoryClear = () => setMemory(0);
  const memoryRecall = () => memory;
  const memoryStore = (val: number) => setMemory(val);
  const memoryAdd = (val: number) => setMemory(prev => prev + val);
  const memorySubtract = (val: number) => setMemory(prev => prev - val);

  return {
    history,
    addHistory,
    clearHistory,
    removeHistoryItem,
    exportAsCsv,
    memory,
    hasMemory: memory !== 0,
    memoryClear,
    memoryRecall,
    memoryStore,
    memoryAdd,
    memorySubtract,
  };
}
