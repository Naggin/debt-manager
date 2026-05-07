import pool from '../database/connection.js';

export const debtController = {
  // Listar dívidas do usuário
  async listDebts(req, res) {
    try {
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT id, uuid, creditor_name, original_amount, current_balance, 
                monthly_interest_rate, due_date, status, notes, created_at 
         FROM debts 
         WHERE user_id = $1 AND deleted_at IS NULL 
         ORDER BY due_date ASC`,
        [userId]
      );

      res.json(result.rows);
    } catch (error) {
      console.error('List debts error:', error);
      res.status(500).json({ error: 'Erro ao buscar dívidas' });
    }
  },

  // Criar dívida
  async createDebt(req, res) {
    try {
      const userId = req.user.id;
      const { creditor_name, original_amount, monthly_interest_rate, due_date, notes } = req.body;

      if (!creditor_name || !original_amount || !monthly_interest_rate) {
        return res.status(400).json({ error: 'Dados obrigatórios faltando' });
      }

      const result = await pool.query(
        `INSERT INTO debts (user_id, creditor_name, original_amount, current_balance, 
                           monthly_interest_rate, due_date, notes, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active') 
         RETURNING id, uuid, creditor_name, current_balance, monthly_interest_rate, status`,
        [userId, creditor_name, original_amount, original_amount, 
         monthly_interest_rate, due_date, notes]
      );

      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Create debt error:', error);
      res.status(500).json({ error: 'Erro ao criar dívida' });
    }
  },

  // Atualizar dívida
  async updateDebt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const { current_balance, status, notes } = req.body;

      const result = await pool.query(
        `UPDATE debts 
         SET current_balance = COALESCE($1, current_balance),
             status = COALESCE($2, status),
             notes = COALESCE($3, notes),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND user_id = $5 
         RETURNING *`,
        [current_balance, status, notes, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Dívida não encontrada' });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error('Update debt error:', error);
      res.status(500).json({ error: 'Erro ao atualizar dívida' });
    }
  },

  // Deletar dívida
  async deleteDebt(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      await pool.query(
        'UPDATE debts SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
        [id, userId]
      );

      res.json({ message: 'Dívida removida com sucesso' });
    } catch (error) {
      console.error('Delete debt error:', error);
      res.status(500).json({ error: 'Erro ao deletar dívida' });
    }
  }
};
