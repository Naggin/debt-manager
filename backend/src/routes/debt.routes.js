import express from 'express';
import { debtController } from '../controllers/debt.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas de dívidas requerem autenticação
router.use(authenticateToken);

router.get('/', debtController.listDebts);
router.post('/', debtController.createDebt);
router.put('/:id', debtController.updateDebt);
router.delete('/:id', debtController.deleteDebt);

export default router;
