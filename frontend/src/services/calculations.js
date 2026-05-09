export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatPercent = (value) => {
  return (value * 100).toFixed(2) + '%';
};

export const generateSnowballStrategy = (debts, totalMonthlyPayment) => {
  const sortedDebts = [...debts].sort((a, b) => a.current_balance - b.current_balance);
  return {
    strategyType: 'snowball',
    name: 'Bola de Neve',
    description: 'Prioriza as dívidas menores primeiro.',
    priorityOrder: sortedDebts.map((debt, index) => ({
      position: index + 1,
      creditor: debt.creditor_name,
      balance: debt.current_balance,
      monthlyRate: debt.monthly_interest_rate,
      reason: `Menor saldo: ${formatCurrency(debt.current_balance)}`
    })),
    pros: ['Pequenas vitórias motivam', 'Reduz número de credores rapidamente'],
    cons: ['Pode pagar mais juros no total']
  };
};

export const generateAvalancheStrategy = (debts, totalMonthlyPayment) => {
  const sortedDebts = [...debts].sort((a, b) => b.monthly_interest_rate - a.monthly_interest_rate);
  return {
    strategyType: 'avalanche',
    name: 'Avalanche',
    description: 'Prioriza as dívidas com maior taxa de juros.',
    priorityOrder: sortedDebts.map((debt, index) => ({
      position: index + 1,
      creditor: debt.creditor_name,
      balance: debt.current_balance,
      monthlyRate: debt.monthly_interest_rate,
      reason: `Taxa mais alta: ${formatPercent(debt.monthly_interest_rate)}`
    })),
    pros: ['Economicamente otimizado', 'Paga menos juros no total'],
    cons: ['Sem vitórias rápidas no início']
  };
};
