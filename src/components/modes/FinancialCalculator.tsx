import React, { useState } from 'react';
import { calculateLoan, calculateCompoundInterest } from '../../utils/financialMath';
import { soundEngine } from '../../utils/soundEngine';
import { Landmark, TrendingUp, DollarSign, Calendar, Percent, PieChart, Table, ArrowUpRight } from 'lucide-react';

interface FinancialCalculatorProps {
  onAddHistory: (expression: string, result: string, meta?: string) => void;
}

export const FinancialCalculator: React.FC<FinancialCalculatorProps> = ({
  onAddHistory,
}) => {
  const [activeTab, setActiveTab] = useState<'loan' | 'compound'>('loan');

  // Loan state
  const [principal, setPrincipal] = useState<number>(350000);
  const [interestRate, setInterestRate] = useState<number>(6.5);
  const [loanYears, setLoanYears] = useState<number>(30);

  // Compound growth state
  const [initialDeposit, setInitialDeposit] = useState<number>(10000);
  const [monthlyContribution, setMonthlyContribution] = useState<number>(500);
  const [annualReturn, setAnnualReturn] = useState<number>(8.0);
  const [investmentYears, setInvestmentYears] = useState<number>(20);

  // Calculations
  const loanResult = calculateLoan(principal, interestRate, loanYears);
  const compoundResult = calculateCompoundInterest(
    initialDeposit, 
    monthlyContribution, 
    annualReturn, 
    investmentYears
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleRecordLoan = () => {
    soundEngine.play('equals');
    const expr = `Mortgage $${principal.toLocaleString()} @ ${interestRate}% for ${loanYears}yr`;
    const res = `${formatCurrency(loanResult.monthlyPayment)}/mo (Total Int: ${formatCurrency(loanResult.totalInterest)})`;
    onAddHistory(expr, res, 'Financial · Loan');
  };

  const handleRecordCompound = () => {
    soundEngine.play('equals');
    const expr = `Growth $${initialDeposit.toLocaleString()} + $${monthlyContribution}/mo @ ${annualReturn}% for ${investmentYears}yr`;
    const res = `${formatCurrency(compoundResult.finalBalance)} (Interest: ${formatCurrency(compoundResult.totalInterest)})`;
    onAddHistory(expr, res, 'Financial · Compound');
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-4">
      {/* Sub-mode Tab Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-theme-card border border-theme-border/70 w-fit">
        <button
          type="button"
          onClick={() => {
            soundEngine.play('toggle');
            setActiveTab('loan');
          }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all
            ${activeTab === 'loan' 
              ? 'bg-theme-accent text-white shadow-xs font-semibold' 
              : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated'}
          `}
        >
          <Landmark className="w-4 h-4" />
          <span>Loan & Mortgage Amortization</span>
        </button>

        <button
          type="button"
          onClick={() => {
            soundEngine.play('toggle');
            setActiveTab('compound');
          }}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-medium transition-all
            ${activeTab === 'compound' 
              ? 'bg-theme-accent text-white shadow-xs font-semibold' 
              : 'text-theme-text-muted hover:text-theme-text hover:bg-theme-elevated'}
          `}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Compound Interest & Wealth Growth</span>
        </button>
      </div>

      {activeTab === 'loan' ? (
        /* ================= Loan & Mortgage Section ================= */
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Input Parameters (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col gap-4">
              <h3 className="font-mono font-bold text-sm text-theme-text flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-theme-accent" />
                <span>Loan Parameters</span>
              </h3>

              {/* Principal Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-theme-text-dim">
                  <span>Loan Principal ($)</span>
                  <span className="font-bold text-theme-text">${principal.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  value={principal}
                  onChange={e => setPrincipal(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3.5 py-2 font-mono text-base font-bold text-theme-text focus:outline-none focus:border-theme-accent"
                />
                <input
                  type="range"
                  min="10000"
                  max="1500000"
                  step="5000"
                  value={principal}
                  onChange={e => setPrincipal(Number(e.target.value))}
                  className="w-full accent-theme-accent cursor-pointer"
                />
              </div>

              {/* Interest Rate */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-theme-text-dim">
                  <span>Annual Interest Rate (%)</span>
                  <span className="font-bold text-theme-text">{interestRate}%</span>
                </div>
                <input
                  type="number"
                  step="0.1"
                  value={interestRate}
                  onChange={e => setInterestRate(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3.5 py-2 font-mono text-base font-bold text-theme-text focus:outline-none focus:border-theme-accent"
                />
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={e => setInterestRate(Number(e.target.value))}
                  className="w-full accent-theme-accent cursor-pointer"
                />
              </div>

              {/* Term Years */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-theme-text-dim">
                  <span>Loan Term (Years)</span>
                  <span className="font-bold text-theme-text">{loanYears} Years ({loanYears * 12} mo)</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[10, 15, 20, 30].map(yr => (
                    <button
                      key={yr}
                      type="button"
                      onClick={() => {
                        soundEngine.play('toggle');
                        setLoanYears(yr);
                      }}
                      className={`
                        py-1.5 rounded-lg text-xs font-mono font-semibold transition-all
                        ${loanYears === yr 
                          ? 'bg-theme-accent text-white shadow-xs' 
                          : 'bg-theme-elevated text-theme-text-muted hover:bg-theme-btn-hover'}
                      `}
                    >
                      {yr} yr
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleRecordLoan}
                className="mt-2 py-2.5 rounded-xl bg-theme-accent text-white font-mono font-semibold text-xs hover:bg-theme-accent/90 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Record Loan to Audit Tape</span>
              </button>
            </div>

            {/* Calculations & Visual Breakdown (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              {/* Primary Payment Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col justify-between">
                  <span className="text-xs font-mono text-theme-text-dim">Monthly Payment</span>
                  <div className="text-2xl font-mono font-bold text-theme-accent mt-2">
                    {formatCurrency(loanResult.monthlyPayment)}
                  </div>
                  <span className="text-[11px] font-mono text-theme-text-dim mt-1">Principal & Interest</span>
                </div>

                <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col justify-between">
                  <span className="text-xs font-mono text-theme-text-dim">Total Interest</span>
                  <div className="text-xl font-mono font-bold text-amber-500 mt-2">
                    {formatCurrency(loanResult.totalInterest)}
                  </div>
                  <span className="text-[11px] font-mono text-theme-text-dim mt-1">Cost of Borrowing</span>
                </div>

                <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col justify-between">
                  <span className="text-xs font-mono text-theme-text-dim">Total Loan Cost</span>
                  <div className="text-xl font-mono font-bold text-theme-text mt-2">
                    {formatCurrency(loanResult.totalCost)}
                  </div>
                  <span className="text-[11px] font-mono text-theme-text-dim mt-1">Over {loanYears} Years</span>
                </div>
              </div>

              {/* Principal vs Interest Breakdown Bar */}
              <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-theme-text">Principal vs. Interest Ratio</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-theme-accent">
                      <span className="w-2.5 h-2.5 rounded-full bg-theme-accent" />
                      Principal: {Math.round((principal / (loanResult.totalCost || 1)) * 100)}%
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                      Interest: {Math.round((loanResult.totalInterest / (loanResult.totalCost || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Progress Stack Bar */}
                <div className="w-full h-4 rounded-full bg-theme-bg overflow-hidden flex border border-theme-border/60">
                  <div 
                    className="h-full bg-theme-accent transition-all duration-300" 
                    style={{ width: `${(principal / (loanResult.totalCost || 1)) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-amber-400 transition-all duration-300" 
                    style={{ width: `${(loanResult.totalInterest / (loanResult.totalCost || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Amortization Milestone Table */}
              <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-theme-text flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-theme-accent" />
                    <span>Amortization Schedule (Milestones)</span>
                  </span>
                  <span className="text-theme-text-dim text-[11px]">{loanYears} Annual Periods</span>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-theme-border/60">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-theme-elevated/70 text-theme-text-dim sticky top-0 border-b border-theme-border/60">
                      <tr>
                        <th className="p-2.5">Year</th>
                        <th className="p-2.5">Beginning</th>
                        <th className="p-2.5">Principal</th>
                        <th className="p-2.5">Interest</th>
                        <th className="p-2.5">Ending</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border/40 text-theme-text-muted">
                      {loanResult.milestones.map(m => (
                        <tr key={m.year} className="hover:bg-theme-elevated/30">
                          <td className="p-2 font-bold text-theme-text">Yr {m.year}</td>
                          <td className="p-2">{formatCurrency(m.beginningBalance)}</td>
                          <td className="p-2 text-theme-accent">{formatCurrency(m.principalPaid)}</td>
                          <td className="p-2 text-amber-400">{formatCurrency(m.interestPaid)}</td>
                          <td className="p-2">{formatCurrency(m.endingBalance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= Compound Interest Section ================= */
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Parameters (5 cols) */}
            <div className="lg:col-span-5 p-5 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col gap-4">
              <h3 className="font-mono font-bold text-sm text-theme-text flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-theme-accent" />
                <span>Investment Inputs</span>
              </h3>

              {/* Initial Deposit */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-theme-text-dim">
                  <span>Initial Principal ($)</span>
                  <span className="font-bold text-theme-text">${initialDeposit.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  value={initialDeposit}
                  onChange={e => setInitialDeposit(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3.5 py-2 font-mono text-base font-bold text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              {/* Monthly Contribution */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-theme-text-dim">
                  <span>Monthly Contribution ($)</span>
                  <span className="font-bold text-theme-text">${monthlyContribution.toLocaleString()}/mo</span>
                </div>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={e => setMonthlyContribution(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3.5 py-2 font-mono text-base font-bold text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              {/* Annual Return */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-theme-text-dim">
                  <span>Estimated Annual Return (%)</span>
                  <span className="font-bold text-theme-text">{annualReturn}%</span>
                </div>
                <input
                  type="number"
                  step="0.5"
                  value={annualReturn}
                  onChange={e => setAnnualReturn(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-theme-bg border border-theme-border/80 rounded-xl px-3.5 py-2 font-mono text-base font-bold text-theme-text focus:outline-none focus:border-theme-accent"
                />
              </div>

              {/* Horizon Years */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-theme-text-dim">
                  <span>Horizon (Years)</span>
                  <span className="font-bold text-theme-text">{investmentYears} Years</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={investmentYears}
                  onChange={e => setInvestmentYears(Number(e.target.value))}
                  className="w-full accent-theme-accent cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleRecordCompound}
                className="mt-2 py-2.5 rounded-xl bg-theme-accent text-white font-mono font-semibold text-xs hover:bg-theme-accent/90 transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Record Portfolio Growth to Audit Tape</span>
              </button>
            </div>

            {/* Compound Results (7 cols) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col justify-between">
                  <span className="text-xs font-mono text-theme-text-dim">Future Portfolio</span>
                  <div className="text-2xl font-mono font-bold text-emerald-400 mt-2">
                    {formatCurrency(compoundResult.finalBalance)}
                  </div>
                  <span className="text-[11px] font-mono text-theme-text-dim mt-1">In {investmentYears} Years</span>
                </div>

                <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col justify-between">
                  <span className="text-xs font-mono text-theme-text-dim">Total Deposited</span>
                  <div className="text-xl font-mono font-bold text-theme-text mt-2">
                    {formatCurrency(compoundResult.totalContributions)}
                  </div>
                  <span className="text-[11px] font-mono text-theme-text-dim mt-1">Your Direct Cash</span>
                </div>

                <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col justify-between">
                  <span className="text-xs font-mono text-theme-text-dim">Interest Earned</span>
                  <div className="text-xl font-mono font-bold text-theme-accent mt-2">
                    {formatCurrency(compoundResult.totalInterest)}
                  </div>
                  <span className="text-[11px] font-mono text-theme-text-dim mt-1">Passive Returns</span>
                </div>
              </div>

              {/* Ratio Bar */}
              <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-theme-text">Wealth Composition</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 text-theme-text">
                      <span className="w-2.5 h-2.5 rounded-full bg-theme-text" />
                      Contributions: {Math.round((compoundResult.totalContributions / (compoundResult.finalBalance || 1)) * 100)}%
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                      Compound Growth: {Math.round((compoundResult.totalInterest / (compoundResult.finalBalance || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="w-full h-4 rounded-full bg-theme-bg overflow-hidden flex border border-theme-border/60">
                  <div 
                    className="h-full bg-theme-text transition-all duration-300" 
                    style={{ width: `${(compoundResult.totalContributions / (compoundResult.finalBalance || 1)) * 100}%` }}
                  />
                  <div 
                    className="h-full bg-emerald-400 transition-all duration-300" 
                    style={{ width: `${(compoundResult.totalInterest / (compoundResult.finalBalance || 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Yearly Growth Progression Table */}
              <div className="p-4 rounded-2xl bg-theme-card border border-theme-border/80 shadow-tactile flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-theme-text flex items-center gap-1.5">
                    <Table className="w-3.5 h-3.5 text-theme-accent" />
                    <span>Annual Growth Schedule</span>
                  </span>
                  <span className="text-theme-text-dim text-[11px]">{investmentYears} Years</span>
                </div>

                <div className="max-h-56 overflow-y-auto rounded-xl border border-theme-border/60">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-theme-elevated/70 text-theme-text-dim sticky top-0 border-b border-theme-border/60">
                      <tr>
                        <th className="p-2.5">Year</th>
                        <th className="p-2.5">Total Deposits</th>
                        <th className="p-2.5">Interest Earned</th>
                        <th className="p-2.5">Total Portfolio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-theme-border/40 text-theme-text-muted">
                      {compoundResult.yearlyData.map(d => (
                        <tr key={d.year} className="hover:bg-theme-elevated/30">
                          <td className="p-2 font-bold text-theme-text">Yr {d.year}</td>
                          <td className="p-2">{formatCurrency(d.totalContributed)}</td>
                          <td className="p-2 text-theme-accent">{formatCurrency(d.totalInterest)}</td>
                          <td className="p-2 font-bold text-emerald-400">{formatCurrency(d.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
