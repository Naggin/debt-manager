import bcryptjs from 'bcryptjs';
import pool from '../database/connection.js';
import { generateToken } from '../middleware/auth.js';

export const authController = {
  async register(req, res) {
    try {
      const { email, password, full_name } = req.body;

      // Validação
      if (!email || !password || !full_name) {
        return res.status(400).json({ error: 'Email, senha e nome são obrigatórios' });
      }

      // Verificar se usuário existe
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({ error: 'Email já registrado' });
      }

      // Hash da senha
      const password_hash = await bcryptjs.hash(password, 10);

      // Inserir usuário
      const result = await pool.query(
        'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, uuid, email, full_name',
        [email, password_hash, full_name]
      );

      const user = result.rows[0];
      const token = generateToken(user.id, user.email);

      res.status(201).json({
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          full_name: user.full_name
        },
        token
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      const validPassword = await bcryptjs.compare(password, user.password_hash);

      if (!validPassword) {
        return res.status(401).json({ error: 'Email ou senha incorretos' });
      }

      const token = generateToken(user.id, user.email);

      res.json({
        user: {
          id: user.id,
          uuid: user.uuid,
          email: user.email,
          full_name: user.full_name
        },
        token
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  },

  async verifyToken(req, res) {
    res.json({ valid: true, user: req.user });
  }
};
