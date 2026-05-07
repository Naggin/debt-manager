import pool from '../database/connection.js';

export const simulatorController = {
  async simulatePayment(req, res) {
    try {
      const userId = req.user.id;
      const { monthly_payment } = req.body;

      if (!monthly_payment || monthly_payment <= 0) {
        return res.status(400).json({ error: 'Valor de pagamento inválido' });
      }

      // Buscar dívidas
      const debtsResult = await pool.query(
        `SELECT id, creditor_name, current_balance, monthly_interest_rate 
         FROM debts 
         WHERE user_id = $1 AND status = 'active' AND deleted_at IS NULL`,
        [userId]
      );

      const debts = debtsResult.rows;

      if (debts.length === 0) {
        return res.status(400).json({ error: 'Nenhuma dívida ativa encontrada' });
      }

      // Simular pagamento
      const simulations = debts.map(debt => {
        let balance = parseFloat(debt.current_balance);
        const monthlyRate = parseFloat(debt.monthly_interest_rate);
        let months = 0;
        let totalInterest = 0;
        const maxMonths = 360;

        while (balance > 0.01 && months < maxMonths) {
          const interest = balance * monthlyRate;
          totalInterest += interest;
          balance = Math.max(0, balance - (monthly_payment - interest));
          months++;
        }

        return {
          creditor: debt.creditor_name,
          originalBalance: debt.current_balance,
          monthsToPayoff: months,
          totalInterestPaid: Math.round(totalInterest * 100) / 100,
          totalPaid: Math.round((monthly_payment * months) * 100) / 100
        };
      });

      const totalMonths = Math.max(...simulations.map(s => s.monthsToPayoff));

      res.json({
        monthlyPayment: monthly_payment,
        debts: simulations,
        estimatedMonthsToFreedom: totalMonths,
        estimatedYears: (totalMonths / 12).toFixed(1)
      });
    } catch (error) {
      console.error('Simulate payment error:', error);
      res.status(500).json({ error: 'Erro ao simular pagamento' });
    }
  }
};
