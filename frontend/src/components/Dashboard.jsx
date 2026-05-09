import React, { useState } from 'react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';
import { formatCurrency, formatPercent } from '../services/calculations';
import DebtForm from './DebtForm';

const INITIAL_DEBTS = [
  { id: 1, creditor_name: 'Nubank', current_balance: 2500, original_amount: 2500, monthly_interest_rate: 0.0399, due_date: '2024-12-01', status: 'active' },
  { id: 2, creditor_name: 'PagBank', current_balance: 1800, original_amount: 1800, monthly_interest_rate: 0.0299, due_date: '2024-11-15', status: 'active' },
  { id: 3, creditor_name: 'Banco do Brasil', current_balance: 5000, original_amount: 5200, monthly_interest_rate: 0.0199, due_date: '2025-01-01', status: 'active' },
  { id: 4, creditor_name: 'Itaú', current_balance: 800, original_amount: 1000, monthly_interest_rate: 0.0249, due_date: '2024-10-15', status: 'active' }
];

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const MetricCard = ({ title, value, color }) => {
  const colors = {
    red: 'border-red-200 bg-red-50 text-red-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    green: 'border-green-200 bg-green-50 text-green-700',
    blue: 'border-blue-200 bg-blue-50 text-blue-700',
  };
  return (
    <div className={`border rounded-xl p-5 shadow-sm ${colors[color]}`}>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
};

export default function Dashboard() {
  const [debts, setDebts] = useState(INITIAL_DEBTS);
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const totalDebt = debts.reduce((s, d) => s + d.current_balance, 0);
  const totalInterest = debts.reduce((s, d) => s + d.current_balance * d.monthly_interest_rate, 0);
  const totalPaid = debts.reduce((s, d) => s + (d.original_amount - d.current_balance), 0);
  const avgRate = debts.length > 0
    ? debts.reduce((s, d) => s + d.monthly_interest_rate, 0) / debts.length
    : 0;

  const pieData = debts.map(d => ({ name: d.creditor_name, value: d.current_balance }));
  const barData = debts.map(d => ({
    name: d.creditor_name,
    Juros: parseFloat((d.current_balance * d.monthly_interest_rate).toFixed(2))
  }));

  const handleSave = async (payload) => {
    const newDebt = {
      id: Date.now(),
      creditor_name: payload.creditor_name,
      current_balance: payload.original_amount,
      original_amount: payload.original_amount,
      monthly_interest_rate: payload.monthly_interest_rate,
      due_date: payload.due_date,
      notes: payload.notes,
      status: 'active'
    };
    setDebts(prev => [...prev, newDebt]);
    setShowForm(false);
  };

  const handleDelete = (id) => {
    setDeletingId(id);
    setTimeout(() => {
      setDebts(prev => prev.filter(d => d.id !== id));
      setDeletingId(null);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">💳 Gestor de Dívidas</h1>
            <p className="text-gray-500 text-sm mt-1">Visualize e gerencie suas dívidas</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors shadow-sm"
          >
            + Adicionar Dívida
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Métricas */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard title="Dívida Total" value={formatCurrency(totalDebt)} color="red" />
          <MetricCard title="Juros Mensais" value={formatCurrency(totalInterest)} color="amber" />
          <MetricCard title="Já Pago" value={formatCurrency(totalPaid)} color="green" />
          <MetricCard title="Taxa Média" value={formatPercent(avgRate)} color="blue" />
        </div>

        {/* Gráficos */}
        {debts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Distribuição das Dívidas</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} dataKey="value"
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Juros Mensais por Credor</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={barData} margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip formatter={v => formatCurrency(v)} />
                  <Bar dataKey="Juros" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tabela */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              Detalhes das Dívidas
              <span className="ml-2 text-sm font-normal text-gray-400">({debts.length} credores)</span>
            </h3>
          </div>

          {debts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-3">💳</p>
              <p className="text-gray-500 font-medium">Nenhuma dívida cadastrada</p>
              <p className="text-gray-400 text-sm mt-1">Clique em "Adicionar Dívida" para começar</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-5 rounded-lg transition-colors"
              >
                + Adicionar primeira dívida
              </button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left font-medium">Credor</th>
                  <th className="px-6 py-3 text-left font-medium">Saldo Atual</th>
                  <th className="px-6 py-3 text-left font-medium">Taxa Mensal</th>
                  <th className="px-6 py-3 text-left font-medium">Juros/Mês</th>
                  <th className="px-6 py-3 text-left font-medium">Vencimento</th>
                  <th className="px-6 py-3 text-left font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {debts.map(d => (
                  <tr
                    key={d.id}
                    className={`hover:bg-gray-50 transition-all ${deletingId === d.id ? 'opacity-0 scale-95' : 'opacity-100'}`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-900">{d.creditor_name}</td>
                    <td className="px-6 py-4 text-gray-700">{formatCurrency(d.current_balance)}</td>
                    <td className="px-6 py-4 text-gray-700">{formatPercent(d.monthly_interest_rate)}</td>
                    <td className="px-6 py-4 font-medium text-red-600">
                      {formatCurrency(d.current_balance * d.monthly_interest_rate)}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(d.due_date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="text-red-400 hover:text-red-600 text-xs font-medium transition-colors hover:bg-red-50 px-2 py-1 rounded"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Ações */}
        <div className="flex gap-3 flex-wrap">
          <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors">
            🎯 Gerar Plano de Ação
          </button>
          <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-5 rounded-lg transition-colors">
            📊 Simular Pagamento
          </button>
        </div>

      </main>

      {/* Modal de Formulário */}
      {showForm && (
        <DebtForm
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}
