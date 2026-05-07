import pool from '../database/connection.js';

export const strategyController = {
  async generateSnowballStrategy(req, res) {
    try {
      const userId = req.user.id;
      const { monthly_payment } = req.body;

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

      const sortedDebts = debts.sort((a, b) => a.current_balance - b.current_balance);

      const strategy = {
        strategyType: 'snowball',
        name: 'Bola de Neve (Método Psicológico)',
        description: 'Prioriza quitação das dívidas menores primeiro',
        priorityOrder: sortedDebts.map((d, idx) => ({
          position: idx + 1,
          creditor: d.creditor_name,
          balance: parseFloat(d.current_balance),
          monthlyRate: parseFloat(d.monthly_interest_rate)
        })),
        monthlyPayment,
        pros: ['Pequenas vitórias motivam', 'Reduz número de credores rapidamente'],
        cons: ['Pode pagar mais juros no total']
      };

      // Salvar no banco
      await pool.query(
        `INSERT INTO simulations (user_id, strategy_type, monthly_payment, simulation_data) 
         VALUES ($1, $2, $3, $4)`,
        [userId, 'snowball', monthly_payment, JSON.stringify(strategy)]
      );

      res.json(strategy);
    } catch (error) {
      console.error('Snowball strategy error:', error);
      res.status(500).json({ error: 'Erro ao gerar estratégia' });
    }
  },

  async generateAvalancheStrategy(req, res) {
    try {
      const userId = req.user.id;
      const { monthly_payment } = req.body;

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

      const sortedDebts = debts.sort((a, b) => 
        parseFloat(b.monthly_interest_rate) - parseFloat(a.monthly_interest_rate)
      );

      const strategy = {
        strategyType: 'avalanche',
        name: 'Avalanche (Método Econômico)',
        description: 'Prioriza quitação das dívidas com maior taxa de juros',
        priorityOrder: sortedDebts.map((d, idx) => ({
          position: idx + 1,
          creditor: d.creditor_name,
          balance: parseFloat(d.current_balance),
          monthlyRate: parseFloat(d.monthly_interest_rate),
          ratePercentage: (parseFloat(d.monthly_interest_rate) * 100).toFixed(2) + '%'
        })),
        monthlyPayment,
        pros: ['Economicamente otimizado', 'Paga menos juros no total'],
        cons: ['Sem vitórias rápidas no início']
      };

      // Salvar no banco
      await pool.query(
        `INSERT INTO simulations (user_id, strategy_type, monthly_payment, simulation_data) 
         VALUES ($1, $2, $3, $4)`,
        [userId, 'avalanche', monthly_payment, JSON.stringify(strategy)]
      );

      res.json(strategy);
    } catch (error) {
      console.error('Avalanche strategy error:', error);
      res.status(500).json({ error: 'Erro ao gerar estratégia' });
    }
  }
};
