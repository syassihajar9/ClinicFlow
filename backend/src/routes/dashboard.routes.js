
const express = require('express');
const { authenticateToken } = require('../middlewares/auth.middleware');

const {
  getDashboardStats,
} = require('../controllers/dashboard.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Statistiques et indicateurs du tableau de bord
 */

router.use(authenticateToken);

/**
 * @swagger
 * /api/dashboard:
 *   get:
 *     summary: Récupérer les statistiques du dashboard
 *     description: >
 *       Retourne les statistiques du tableau de bord pour un utilisateur
 *       authentifié.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Statistiques récupérées avec succès
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/', getDashboardStats);

module.exports = router;
