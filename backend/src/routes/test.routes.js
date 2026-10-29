
const express = require('express');
const {
  authenticateToken,
  requireRole,
} = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tests de sécurité
 *   description: Vérification de l'authentification et des rôles
 */

/**
 * @swagger
 * /api/test/protected:
 *   get:
 *     summary: Tester l'authentification JWT
 *     description: Accessible à tout utilisateur connecté disposant d'un token JWT valide.
 *     tags: [Tests de sécurité]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Accès autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Accès autorisé : token JWT valide."
 *                 user:
 *                   type: object
 *                   description: Informations utilisateur extraites du token JWT
 *                   additionalProperties: true
 *       '401':
 *         description: Token absent ou invalide
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/protected', authenticateToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Accès autorisé : token JWT valide.',
    user: req.user,
  });
});

/**
 * @swagger
 * /api/test/admin:
 *   get:
 *     summary: Tester l'accès administrateur
 *     description: Accessible uniquement à un utilisateur authentifié ayant le rôle admin.
 *     tags: [Tests de sécurité]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Accès administrateur autorisé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Accès administrateur autorisé."
 *       '401':
 *         description: Token absent ou invalide
 *       '403':
 *         description: Accès réservé aux administrateurs
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get(
  '/admin',
  authenticateToken,
  requireRole('admin'),
  (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Accès administrateur autorisé.',
    });
  }
);

module.exports = router;
