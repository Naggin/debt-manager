import express from 'express';
import { simulatorController } from '../controllers/simulator.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/calculate', authenticateToken, simulatorController.simulatePayment);

export default router;
