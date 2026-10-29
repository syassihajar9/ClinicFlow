
const express = require('express');
const { login, me } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Authentification
 *     description: Connexion et informations de l'utilisateur connecté
 */

// Connexion publique
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connecter un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@clinicflow.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: VotreMotDePasse
 *     responses:
 *       '200':
 *         description: Connexion réussie
 *       '400':
 *         description: Données manquantes ou invalides
 *       '401':
 *         description: Identifiants incorrects
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post('/login', login);

// Récupérer les informations de l'utilisateur connecté
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Informations utilisateur récupérées
 *       '401':
 *         description: Token absent ou invalide
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/me', authenticateToken, me);

module.exports = router;
