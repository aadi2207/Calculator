// Financial Calculator Engine: Loan Amortization and Compound Interest Growth

import { 
  LoanCalculationResult, 
  LoanMilestone, 
  CompoundCalculationResult, 
  CompoundYearPoint 
} from '../types/calculator';

export function calculateLoan(
  principal: number,
  annualRatePct: number,
  termYears: number
): LoanCalculationResult {
  if (principal <= 0 || termYears <= 0) {
    return {
      monthlyPayment: 0,
      totalInterest: 0,
      totalCost: 0,
      payoffMonths: 0,
      milestones: []
    };
  }

  const totalMonths = Math.round(termYears * 12);
  const monthlyRate = (annualRatePct / 100) / 12;

  let monthlyPayment = 0;
  if (monthlyRate === 0) {
    monthlyPayment = principal / totalMonths;
  } else {
    monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                     (Math.pow(1 + monthlyRate, totalMonths) - 1);
  }

  const milestones: LoanMilestone[] = [];
  let currentBalance = principal;
  let accumulatedInterest = 0;

  for (let year = 1; year <= termYears; year++) {
    const startBalanceOfYear = currentBalance;
    let yearPrincipalPaid = 0;
    let yearInterestPaid = 0;

    for (let m = 0; m < 12; m++) {
      if (currentBalance <= 0) break;
      const interestForMonth = currentBalance * monthlyRate;
      const principalForMonth = Math.min(currentBalance, monthlyPayment - interestForMonth);

      yearInterestPaid += interestForMonth;
      yearPrincipalPaid += principalForMonth;
      accumulatedInterest += interestForMonth;
      currentBalance -= principalForMonth;
    }

    milestones.push({
      year,
      beginningBalance: startBalanceOfYear,
      principalPaid: yearPrincipalPaid,
      interestPaid: yearInterestPaid,
      endingBalance: Math.max(0, currentBalance),
    });
  }

  const totalCost = principal + accumulatedInterest;

  return {
    monthlyPayment,
    totalInterest: accumulatedInterest,
    totalCost,
    payoffMonths: totalMonths,
    milestones,
  };
}

export function calculateCompoundInterest(
  initialDeposit: number,
  monthlyContribution: number,
  annualReturnPct: number,
  years: number
): CompoundCalculationResult {
  const totalMonths = Math.round(years * 12);
  const monthlyRate = (annualReturnPct / 100) / 12;

  let balance = initialDeposit;
  let totalDeposits = initialDeposit;
  const yearlyData: CompoundYearPoint[] = [];

  yearlyData.push({
    year: 0,
    balance: initialDeposit,
    totalContributed: initialDeposit,
    totalInterest: 0,
  });

  for (let m = 1; m <= totalMonths; m++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    totalDeposits += monthlyContribution;

    if (m % 12 === 0) {
      const year = m / 12;
      const interestEarned = Math.max(0, balance - totalDeposits);
      yearlyData.push({
        year,
        balance,
        totalContributed: totalDeposits,
        totalInterest: interestEarned,
      });
    }
  }

  const totalInterest = Math.max(0, balance - totalDeposits);

  return {
    finalBalance: balance,
    totalContributions: totalDeposits,
    totalInterest,
    yearlyData,
  };
}
