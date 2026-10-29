
const express = require('express');

const {
  authenticateToken,
  requireRole,
} = require('../middlewares/auth.middleware');

const validate = require('../middlewares/validate.middleware');

const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUsersSchema,
} = require('../validators/user.validator');

const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/users.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des comptes utilisateurs réservée aux administrateurs
 */

// Toutes les routes nécessitent une authentification et le rôle admin.
router.use(authenticateToken, requireRole('admin'));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister les utilisateurs
 *     description: Récupère la liste des utilisateurs. Accès administrateur uniquement.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Liste des utilisateurs récupérée avec succès
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '403':
 *         description: Accès réservé aux administrateurs
 *       '400':
 *         description: Paramètres de recherche invalides
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/', validate(listUsersSchema), getUsers);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Créer un utilisateur
 *     description: Crée un compte utilisateur. Accès administrateur uniquement.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Données du compte conformément au validateur du projet.
 *             additionalProperties: true
 *     responses:
 *       '201':
 *         description: Utilisateur créé avec succès
 *       '400':
 *         description: Données invalides
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '403':
 *         description: Accès réservé aux administrateurs
 *       '409':
 *         description: Conflit avec un utilisateur existant, si applicable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post('/', validate(createUserSchema), createUser);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Consulter un utilisateur par son ID
 *     description: Accès administrateur uniquement.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l'utilisateur
 *     responses:
 *       '200':
 *         description: Utilisateur récupéré avec succès
 *       '400':
 *         description: Identifiant invalide
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '403':
 *         description: Accès réservé aux administrateurs
 *       '404':
 *         description: Utilisateur introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/:id', validate(getUserSchema), getUserById);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     description: Modifie un compte utilisateur. Accès administrateur uniquement.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l'utilisateur à modifier
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Champs modifiables conformément au validateur du projet.
 *             additionalProperties: true
 *     responses:
 *       '200':
 *         description: Utilisateur modifié avec succès
 *       '400':
 *         description: Identifiant ou données invalides
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '403':
 *         description: Accès réservé aux administrateurs
 *       '404':
 *         description: Utilisateur introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put('/:id', validate(updateUserSchema), updateUser);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     description: Supprime un compte utilisateur. Accès administrateur uniquement.
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant de l'utilisateur à supprimer
 *     responses:
 *       '200':
 *         description: Utilisateur supprimé avec succès
 *       '400':
 *         description: Identifiant invalide
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '403':
 *         description: Accès réservé aux administrateurs
 *       '404':
 *         description: Utilisateur introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.delete('/:id', validate(getUserSchema), deleteUser);

module.exports = router;
