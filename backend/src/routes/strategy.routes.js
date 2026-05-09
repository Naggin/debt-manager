import express from 'express';
import { strategyController } from '../controllers/strategy.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/snowball', authenticateToken, strategyController.generateSnowballStrategy);
router.post('/avalanche', authenticateToken, strategyController.generateAvalancheStrategy);

export default router;
