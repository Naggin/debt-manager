export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export const formatPercent = (value) => {
  return (value * 100).toFixed(2) + '%';
};

// Simula o pagamento real mês a mês seguindo a ordem da estratégia
export const simulateStrategy = (debts, monthlyPayment) => {
  if (!debts.length) return { months: 0, totalPaid: 0, totalInterest: 0 };

  // Clonar dívidas com saldos
  let remaining = debts.map(d => ({ ...d, balance: d.current_balance }));
  let months = 0;
  let totalPaid = 0;
  const maxMonths = 360;

  while (remaining.some(d => d.balance > 0.01) && months < maxMonths) {
    let payment = monthlyPayment;

    // Aplicar juros em todas as dívidas
    remaining = remaining.map(d => ({
      ...d,
      balance: d.balance > 0.01 ? d.balance * (1 + d.monthly_interest_rate) : 0
    }));

    // Pagar mínimo (juros) em todas exceto a primeira
    for (let i = 1; i < remaining.length; i++) {
      if (remaining[i].balance > 0.01) {
        const minPayment = Math.min(
          remaining[i].balance * remaining[i].monthly_interest_rate * 1.1,
          remaining[i].balance
        );
        remaining[i].balance = Math.max(0, remaining[i].balance - minPayment);
        payment -= minPayment;
        totalPaid += minPayment;
      }
    }

    // Resto vai para a primeira dívida
    if (payment > 0 && remaining[0].balance > 0.01) {
      const paid = Math.min(payment, remaining[0].balance);
      remaining[0].balance = Math.max(0, remaining[0].balance - paid);
      totalPaid += paid;
    }

    // Remover dívidas pagas e reordenar
    remaining = remaining.filter(d => d.balance > 0.01);
    months++;
  }

  const totalDebt = debts.reduce((s, d) => s + d.current_balance, 0);
  return {
    months,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalInterest: Math.round((totalPaid - totalDebt) * 100) / 100
  };
};

export const generateSnowballStrategy = (debts, totalMonthlyPayment) => {
  const sortedDebts = [...debts].sort((a, b) => a.current_balance - b.current_balance);
  const result = simulateStrategy(sortedDebts, totalMonthlyPayment);

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
    months: result.months,
    totalPaid: result.totalPaid,
    totalInterest: result.totalInterest,
    pros: ['Pequenas vitórias motivam', 'Reduz número de credores rapidamente'],
    cons: ['Pode pagar mais juros no total']
  };
};

export const generateAvalancheStrategy = (debts, totalMonthlyPayment) => {
  const sortedDebts = [...debts].sort((a, b) => b.monthly_interest_rate - a.monthly_interest_rate);
  const result = simulateStrategy(sortedDebts, totalMonthlyPayment);

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
    months: result.months,
    totalPaid: result.totalPaid,
    totalInterest: result.totalInterest,
    pros: ['Economicamente otimizado', 'Paga menos juros no total'],
    cons: ['Sem vitórias rápidas no início']
  };
};
