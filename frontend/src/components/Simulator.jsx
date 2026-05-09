import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency, formatPercent } from '../services/calculations';

export default function Simulator({ debts = [], onBack }) {
  const [monthlyPayment, setMonthlyPayment] = useState(1000);
  const [inputValue, setInputValue] = useState('1000');

  const totalDebt = debts.reduce((s, d) => s + d.current_balance, 0);
  const totalMonthlyInterest = debts.reduce((s, d) => s + d.current_balance * d.monthly_interest_rate, 0);
  const minPayment = Math.ceil(totalMonthlyInterest * 1.1);
  const maxSlider = Math.max(totalDebt, monthlyPayment * 2, 5000);

  // Simulação mês a mês
  const simulation = useMemo(() => {
    if (!debts.length || monthlyPayment <= 0) return null;

    let remaining = debts.map(d => ({ ...d, balance: d.current_balance }));
    const chartData = [{ month: 'Início', saldo: Math.round(totalDebt) }];
    let totalPaid = 0;
    let totalInterest = 0;
    let months = 0;
    const maxMonths = 360;

    while (remaining.some(d => d.balance > 0.01) && months < maxMonths) {
      let payment = monthlyPayment;

      remaining = remaining.map(d => {
        if (d.balance <= 0.01) return d;
        const interest = d.balance * d.monthly_interest_rate;
        totalInterest += interest;
        return { ...d, balance: d.balance + interest };
      });

      remaining = remaining.map(d => {
        if (d.balance <= 0.01 || payment <= 0) return d;
        const paid = Math.min(payment, d.balance);
        payment -= paid;
        totalPaid += paid;
        return { ...d, balance: Math.max(0, d.balance - paid) };
      });

      months++;
      const saldoRestante = remaining.reduce((s, d) => s + d.balance, 0);

      if (months % 2 === 0 || saldoRestante < 0.01) {
        chartData.push({
          month: `Mês ${months}`,
          saldo: Math.round(Math.max(0, saldoRestante))
        });
      }
    }

    const debtSimulations = debts.map(debt => {
      let balance = debt.current_balance;
      let m = 0;
      let interest = 0;
      const maxM = 360;
      while (balance > 0.01 && m < maxM) {
        const i = balance * debt.monthly_interest_rate;
        interest += i;
        balance = Math.max(0, balance + i - monthlyPayment);
        m++;
      }
      return {
        creditor: debt.creditor_name,
        balance: debt.current_balance,
        months: m,
        totalInterest: Math.round(interest * 100) / 100,
        totalPaid: Math.round((debt.current_balance + interest) * 100) / 100
      };
    });

    return {
      months,
      totalPaid: Math.round(totalPaid * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      chartData,
      debtSimulations,
      feasible: monthlyPayment > totalMonthlyInterest
    };
  }, [debts, monthlyPayment]);

  const handleSlider = (e) => {
    const val = Number(e.target.value);
    setMonthlyPayment(val);
    setInputValue(String(val));
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    const val = Number(e.target.value);
    if (!isNaN(val) && val > 0) setMonthlyPayment(val);
  };

  if (debts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-gray-600 font-medium text-lg">Nenhuma dívida cadastrada</p>
          <button onClick={onBack} className="mt-6 bg-blue-600 text-white font-medium py-2.5 px-6 rounded-lg">
            ← Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-8 py-5">
        <div className="max-w-7xl mx-auto">
          <button onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-1">
            ← Voltar ao Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">📊 Simulador de Pagamento</h1>
          <p className="text-gray-500 text-sm mt-1">Veja quanto tempo leva para quitar suas dívidas</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Controle de Pagamento */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-6">💰 Quanto você pode pagar por mês?</h2>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-gray-500 text-sm font-medium w-24">R$</span>
            <input
              type="number"
              value={inputValue}
              onChange={handleInput}
              min={minPayment}
              className="w-40 border border-gray-300 rounded-lg px-4 py-2 text-lg font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-gray-400 text-sm">por mês</span>
          </div>

          <input
            type="range"
            min={minPayment}
            max={maxSlider}
            value={monthlyPayment}
            onChange={handleSlider}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />

          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Mínimo: {formatCurrency(minPayment)}</span>
            <span>Máximo: {formatCurrency(maxSlider)}</span>
          </div>

          {/* Alerta pagamento insuficiente */}
          {monthlyPayment <= totalMonthlyInterest && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Pagamento insuficiente! Os juros mensais são {formatCurrency(totalMonthlyInterest)}.
              </p>
              <p className="text-xs text-red-500 mt-1">
                Aumente para pelo menos {formatCurrency(minPayment)} para reduzir o saldo.
              </p>
            </div>
          )}

          {/* Botões rápidos */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {[500, 1000, 1500, 2000, 3000, 5000].map(val => (
              <button
                key={val}
                onClick={() => { setMonthlyPayment(val); setInputValue(String(val)); }}
                className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
                  monthlyPayment === val
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                {formatCurrency(val)}
              </button>
            ))}
          </div>
        </div>

        {/* Métricas */}
        {simulation && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">Tempo Total</p>
              <p className="text-2xl font-bold text-blue-700 mt-1">
                {simulation.feasible ? `${simulation.months} meses` : '∞'}
              </p>
              <p className="text-xs text-blue-500 mt-1">
                {simulation.feasible ? `≈ ${(simulation.months / 12).toFixed(1)} anos` : 'Pagamento insuficiente'}
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
              <p className="text-xs font-medium text-purple-600 uppercase tracking-wide">Total a Pagar</p>
              <p className="text-2xl font-bold text-purple-700 mt-1">
                {simulation.feasible ? formatCurrency(simulation.totalPaid) : '—'}
              </p>
              <p className="text-xs text-purple-500 mt-1">{simulation.months} × {formatCurrency(monthlyPayment)}</p>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <p className="text-xs font-medium text-red-600 uppercase tracking-wide">Juros Totais</p>
              <p className="text-2xl font-bold text-red-700 mt-1">
                {simulation.feasible ? formatCurrency(simulation.totalInterest) : '—'}
              </p>
              <p className="text-xs text-red-500 mt-1">
                {simulation.feasible ? `${((simulation.totalInterest / totalDebt) * 100).toFixed(0)}% do valor original` : ''}
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="text-xs font-medium text-green-600 uppercase tracking-wide">Juros/Mês agora</p>
              <p className="text-2xl font-bold text-green-700 mt-1">{formatCurrency(totalMonthlyInterest)}</p>
              <p className="text-xs text-green-500 mt-1">
                {((totalMonthlyInterest / monthlyPayment) * 100).toFixed(0)}% do seu pagamento
              </p>
            </div>
          </div>
        )}

        {/* Gráfico de Projeção */}
        {simulation && simulation.feasible && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="font-semibold text-gray-800 mb-6">📈 Projeção do Saldo ao Longo do Tempo</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={simulation.chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `R$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => formatCurrency(v)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="saldo"
                  name="Saldo Restante"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Simulação por credor */}
        {simulation && simulation.feasible && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h3 className="font-semibold text-gray-800">Simulação por Credor</h3>
              <p className="text-sm text-gray-400 mt-0.5">Pagando {formatCurrency(monthlyPayment)} distribuído entre todas as dívidas</p>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Credor</th>
                  <th className="px-6 py-3 text-left font-medium">Saldo Atual</th>
                  <th className="px-6 py-3 text-left font-medium">Meses</th>
                  <th className="px-6 py-3 text-left font-medium">Juros</th>
                  <th className="px-6 py-3 text-left font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {simulation.debtSimulations.map((d, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">{d.creditor}</td>
                    <td className="px-6 py-4 text-gray-700">{formatCurrency(d.balance)}</td>
                    <td className="px-6 py-4 text-blue-600 font-medium">{d.months} meses</td>
                    <td className="px-6 py-4 text-red-500">{formatCurrency(d.totalInterest)}</td>
                    <td className="px-6 py-4 font-medium text-purple-700">{formatCurrency(d.totalPaid)}</td>
                  </tr>
                ))}
                <tr className="bg-gray-50 font-semibold">
                  <td className="px-6 py-4 text-gray-900">TOTAL</td>
                  <td className="px-6 py-4 text-gray-900">{formatCurrency(totalDebt)}</td>
                  <td className="px-6 py-4 text-blue-700">{simulation.months} meses</td>
                  <td className="px-6 py-4 text-red-600">{formatCurrency(simulation.totalInterest)}</td>
                  <td className="px-6 py-4 text-purple-800">{formatCurrency(simulation.totalPaid)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Dica */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 pb-8">
          <p className="font-semibold text-amber-900 mb-2">💡 Dica</p>
          <p className="text-sm text-amber-800">
            Aumentar o pagamento mensal reduz drasticamente o tempo e os juros totais.
            Tente aumentar o slider acima para ver o impacto!
          </p>
        </div>

      </main>
    </div>
  );
}
