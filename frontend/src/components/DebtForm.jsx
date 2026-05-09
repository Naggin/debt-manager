import React, { useState } from 'react';
import { formatCurrency } from '../services/calculations';

const INPUT_CLASS = "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition";
const LABEL_CLASS = "block text-sm font-medium text-gray-700 mb-1";

const CREDORES_SUGERIDOS = [
  'Nubank', 'PagBank', 'Itaú', 'Bradesco', 'Banco do Brasil',
  'Santander', 'Caixa', 'Inter', 'C6 Bank', 'Mercado Pago',
  'Financiamento', 'Empréstimo Pessoal', 'Outro'
];

export default function DebtForm({ onSave, onCancel }) {
  const [form, setForm] = useState({
    creditor_name: '',
    original_amount: '',
    monthly_interest_rate: '',
    due_date: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = CREDORES_SUGERIDOS.filter(c =>
    c.toLowerCase().includes(form.creditor_name.toLowerCase()) &&
    form.creditor_name.length > 0
  );

  const validate = () => {
    const e = {};
    if (!form.creditor_name.trim()) e.creditor_name = 'Informe o credor';
    if (!form.original_amount || Number(form.original_amount) <= 0)
      e.original_amount = 'Informe um valor válido';
    if (!form.monthly_interest_rate || Number(form.monthly_interest_rate) < 0)
      e.monthly_interest_rate = 'Informe a taxa de juros';
    if (!form.due_date) e.due_date = 'Informe o vencimento';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        creditor_name: form.creditor_name,
        original_amount: parseFloat(form.original_amount),
        monthly_interest_rate: parseFloat(form.monthly_interest_rate) / 100,
        due_date: form.due_date,
        notes: form.notes
      };
      await onSave(payload);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const monthlyInterest = form.original_amount && form.monthly_interest_rate
    ? (parseFloat(form.original_amount) * parseFloat(form.monthly_interest_rate) / 100)
    : 0;

  const annualInterest = monthlyInterest * 12;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Nova Dívida</h2>
            <p className="text-sm text-gray-500 mt-0.5">Preencha os dados do credor</p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Credor */}
          <div className="relative">
            <label className={LABEL_CLASS}>Credor *</label>
            <input
              type="text"
              name="creditor_name"
              value={form.creditor_name}
              onChange={handleChange}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Ex: Nubank, Itaú, Financiamento..."
              className={`${INPUT_CLASS} ${errors.creditor_name ? 'border-red-400' : ''}`}
            />
            {errors.creditor_name && (
              <p className="text-red-500 text-xs mt-1">{errors.creditor_name}</p>
            )}
            {showSuggestions && filtered.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto">
                {filtered.map(c => (
                  <li
                    key={c}
                    onMouseDown={() => {
                      setForm(prev => ({ ...prev, creditor_name: c }));
                      setShowSuggestions(false);
                    }}
                    className="px-4 py-2.5 text-sm hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Valor */}
          <div>
            <label className={LABEL_CLASS}>Valor da Dívida (R$) *</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">R$</span>
              <input
                type="number"
                name="original_amount"
                value={form.original_amount}
                onChange={handleChange}
                placeholder="0,00"
                min="0"
                step="0.01"
                className={`${INPUT_CLASS} pl-9 ${errors.original_amount ? 'border-red-400' : ''}`}
              />
            </div>
            {errors.original_amount && (
              <p className="text-red-500 text-xs mt-1">{errors.original_amount}</p>
            )}
          </div>

          {/* Taxa */}
          <div>
            <label className={LABEL_CLASS}>Taxa de Juros Mensal (%) *</label>
            <div className="relative">
              <input
                type="number"
                name="monthly_interest_rate"
                value={form.monthly_interest_rate}
                onChange={handleChange}
                placeholder="Ex: 3.99"
                min="0"
                step="0.01"
                className={`${INPUT_CLASS} pr-8 ${errors.monthly_interest_rate ? 'border-red-400' : ''}`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
            </div>
            {errors.monthly_interest_rate && (
              <p className="text-red-500 text-xs mt-1">{errors.monthly_interest_rate}</p>
            )}

            {/* Taxas rápidas */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {[1.99, 2.49, 2.99, 3.49, 3.99, 4.99].map(rate => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, monthly_interest_rate: String(rate) }))}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    parseFloat(form.monthly_interest_rate) === rate
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-600 hover:border-blue-400 hover:text-blue-600'
                  }`}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          {/* Preview de juros */}
          {monthlyInterest > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-xs font-medium text-amber-800 mb-2">💡 Impacto dos Juros</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-amber-600">Juros mensais</p>
                  <p className="text-base font-bold text-amber-800">{formatCurrency(monthlyInterest)}</p>
                </div>
                <div>
                  <p className="text-xs text-amber-600">Juros anuais</p>
                  <p className="text-base font-bold text-amber-800">{formatCurrency(annualInterest)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Vencimento */}
          <div>
            <label className={LABEL_CLASS}>Data de Vencimento *</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              className={`${INPUT_CLASS} ${errors.due_date ? 'border-red-400' : ''}`}
            />
            {errors.due_date && (
              <p className="text-red-500 text-xs mt-1">{errors.due_date}</p>
            )}
          </div>

          {/* Observações */}
          <div>
            <label className={LABEL_CLASS}>Observações <span className="text-gray-400 font-normal">(opcional)</span></label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Ex: parcela do carro, cartão de crédito..."
              className={`${INPUT_CLASS} resize-none`}
            />
          </div>

          {/* Botões */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-gray-300 text-gray-700 font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Salvando...' : '+ Adicionar Dívida'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
