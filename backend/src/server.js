import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import debtRoutes from './routes/debt.routes.js';
import simulatorRoutes from './routes/simulator.routes.js';
import strategyRoutes from './routes/strategy.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Servidor está funcionando!'
  });
});

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/simulator', simulatorRoutes);
app.use('/api/strategy', strategyRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Erro interno do servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
  console.log(`📚 Endpoints disponíveis:`);
  console.log(`   GET  /api/health`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/debts`);
  console.log(`   POST /api/debts`);
  console.log(`   PUT  /api/debts/:id`);
  console.log(`   POST /api/simulator/calculate`);
  console.log(`   POST /api/strategy/snowball`);
  console.log(`   POST /api/strategy/avalanche\n`);
});

export default app;
