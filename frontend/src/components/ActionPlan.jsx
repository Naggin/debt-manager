import React, { useState } from 'react';
import { formatCurrency, formatPercent, generateSnowballStrategy, generateAvalancheStrategy } from '../services/calculations';

const medals = ['🥇', '🥈', '🥉'];

const StrategyCard = ({ strategy, isActive, onSelect }) => (
  <div
    onClick={onSelect}
    className={`cursor-pointer rounded-xl border-2 p-5 transition-all ${
      isActive
        ? 'border-blue-500 bg-blue-50 shadow-md'
        : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
    }`}
  >
    <div className="flex items-start justify-between mb-3">
      <div>
        <h3 className="font-semibold text-gray-900 text-base">{strategy.name}</h3>
        <p className="text-sm text-gray-500 mt-1">{strategy.description}</p>
      </div>
      {isActive && (
        <span className="bg-blue-600 text-white text-xs font-medium px-2.5 py-1 rounded-full ml-3 shrink-0">
          ✓ Ativa
        </span>
      )}
    </div>

    <div className="space-y-1.5 mb-4">
      {strategy.pros.map((pro, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-green-500 mt-0.5">✓</span>
          <span className="text-sm text-gray-600">{pro}</span>
        </div>
      ))}
      {strategy.cons.map((con, i) => (
        <div key={i} className="flex items-start gap-2">
          <span className="text-red-400 mt-0.5">✗</span>
          <span className="text-sm text-gray-500">{con}</span>
        </div>
      ))}
    </div>

    <button
      className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
      }`}
    >
      {isActive ? '✓ Selecionada' : 'Selecionar'}
    </button>
  </div>
);

const PriorityItem = ({ item, index, debts }) => {
  const debt = debts.find(d => d.creditor_name === item.creditor);
  const annualInterest = item.balance * item.monthlyRate * 12;
  const medal = index < 3 ? medals[index] : null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
      <div className="flex items-start gap-4">
        {/* Posição */}
        <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 font-bold text-lg ${
          index === 0 ? 'bg-yellow-100 text-yellow-700' :
          index === 1 ? 'bg-gray-100 text-gray-600' :
          index === 2 ? 'bg-orange-100 text-orange-700' :
          'bg-blue-50 text-blue-600'
        }`}>
          {medal || item.position}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="font-semibold text-gray-900">{item.creditor}</h4>
            <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full shrink-0">
              {item.reason}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Saldo</p>
              <p className="font-bold text-blue-700 text-sm">{formatCurrency(item.balance)}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Taxa/Mês</p>
              <p className="font-bold text-red-600 text-sm">{formatPercent(item.monthlyRate)}</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Juros/Ano</p>
              <p className="font-bold text-amber-700 text-sm">{formatCurrency(annualInterest)}</p>
            </div>
          </div>

          {/* Barra proporcional */}
          <div className="mt-3 bg-gray-100 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all"
              style={{ width: `${Math.min(100, (item.monthlyRate / 0.05) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, color }) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    purple: 'bg-purple-50 text-purple-700',
    red: 'bg-red-50 text-red-700',
  };
  return (
    <div className={`${colors[color]} rounded-xl p-4`}>
      <p className="text-xs font-medium opacity-70 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

export default function ActionPlan({ debts = [], monthlyPayment = 1000, onBack }) {
  const [activeStrategy, setActiveStrategy] = useState('snowball');

  if (debts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">💳</p>
          <p className="text-gray-600 font-medium text-lg">Nenhuma dívida cadastrada</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Adicione dívidas no Dashboard para gerar um plano</p>
          <button
            onClick={onBack}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  const snowball = generateSnowballStrategy(debts, monthlyPayment);
  const avalanche = generateAvalancheStrategy(debts, monthlyPayment);
  const current = activeStrategy === 'snowball' ? snowball : avalanche;

  const totalDebt = debts.reduce((s, d) => s + d.current_balance, 0);
  const totalMonthlyInterest = debts.reduce((s, d) => s + d.current_balance * d.monthly_interest_rate, 0);

  // Estimativa simples de meses
  const estimatedMonths = monthlyPayment > totalMonthlyInterest
    ? Math.ceil(totalDebt / (monthlyPayment - totalMonthlyInterest))
    : null;

  const totalPaid = estimatedMonths ? monthlyPayment * estimatedMonths : null;
  const totalInterestPaid = totalPaid ? totalPaid - totalDebt : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <button
              onClick={onBack}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1 transition-colors"
            >
              ← Voltar ao Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">🎯 Plano de Ação</h1>
            <p className="text-gray-500 text-sm mt-1">Estratégia personalizada para quitar suas dívidas</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Escolha da Estratégia */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Escolha sua estratégia</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <StrategyCard
              strategy={snowball}
              isActive={activeStrategy === 'snowball'}
              onSelect={() => setActiveStrategy('snowball')}
            />
            <StrategyCard
              strategy={avalanche}
              isActive={activeStrategy === 'avalanche'}
              onSelect={() => setActiveStrategy('avalanche')}
            />
          </div>
        </section>

        {/* Resumo */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📊 Resumo — {current.name}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              label="Pagamento/Mês"
              value={formatCurrency(monthlyPayment)}
              color="blue"
            />
            <SummaryCard
              label="Tempo Estimado"
              value={estimatedMonths ? `${estimatedMonths} meses` : 'Insuficiente'}
              color="green"
            />
            <SummaryCard
              label="Total a Pagar"
              value={totalPaid ? formatCurrency(totalPaid) : '—'}
              color="purple"
            />
            <SummaryCard
              label="Juros Totais"
              value={totalInterestPaid ? formatCurrency(totalInterestPaid) : '—'}
              color="red"
            />
          </div>

          {/* Alerta pagamento insuficiente */}
          {monthlyPayment <= totalMonthlyInterest && (
            <div className="mt-4 bg-red-100 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Pagamento insuficiente para cobrir os juros!
              </p>
              <p className="text-xs text-red-600 mt-1">
                Mínimo necessário: {formatCurrency(totalMonthlyInterest + 100)}/mês
              </p>
            </div>
          )}
        </section>

        {/* Lista de Prioridades */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            📋 Ordem de Pagamento
          </h2>
          <div className="space-y-3">
            {current.priorityOrder.map((item, index) => (
              <PriorityItem
                key={item.creditor}
                item={item}
                index={index}
                debts={debts}
              />
            ))}
          </div>
        </section>

        {/* Dicas */}
        <section className="bg-green-50 border border-green-200 rounded-xl p-6">
          <h3 className="font-semibold text-green-900 mb-3">💡 Dicas para o sucesso</h3>
          <ul className="space-y-2">
            {[
              'Pague sempre a dívida #1 da lista com tudo que puder',
              'Nas demais dívidas, pague apenas o mínimo',
              'Quando quitar a #1, redirecione o valor para a #2',
              'Automatize os pagamentos para não perder datas',
              'Comemore cada dívida quitada! 🎉'
            ].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-green-800">
                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                {tip}
              </li>
            ))}
          </ul>
        </section>

        {/* Botões */}
        <div className="flex gap-3 flex-wrap pb-8">
          <button
            onClick={onBack}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2.5 px-6 rounded-lg transition-colors"
          >
            ← Voltar
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
            ✓ Iniciar Estratégia
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
            📊 Ir para Simulador
          </button>
        </div>

      </main>
    </div>
  );
}
