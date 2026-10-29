
const express = require('express');

const {
  authenticateToken,
  requireRole,
} = require('../middlewares/auth.middleware');

const validate = require('../middlewares/validate.middleware');

const {
  createPatientSchema,
  updatePatientSchema,
  getPatientSchema,
  listPatientsSchema,
} = require('../validators/patient.validator');

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} = require('../controllers/patients.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Patients
 *   description: Gestion des patients
 */

// Toutes les routes patients nécessitent une authentification.
router.use(authenticateToken);

/**
 * @swagger
 * /api/patients:
 *   get:
 *     summary: Lister et rechercher les patients
 *     description: Récupère la liste des patients avec recherche et pagination.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Liste des patients récupérée avec succès
 *       '400':
 *         description: Paramètres de recherche ou de pagination invalides
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/', validate(listPatientsSchema), getPatients);

/**
 * @swagger
 * /api/patients:
 *   post:
 *     summary: Créer un patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Données du patient conformément au validateur du projet.
 *             additionalProperties: true
 *     responses:
 *       '201':
 *         description: Patient créé avec succès
 *       '400':
 *         description: Données du patient invalides
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '409':
 *         description: Conflit avec un patient existant, si applicable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post('/', validate(createPatientSchema), createPatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   get:
 *     summary: Consulter un patient par son ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du patient
 *     responses:
 *       '200':
 *         description: Patient récupéré avec succès
 *       '400':
 *         description: Identifiant invalide
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '404':
 *         description: Patient introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/:id', validate(getPatientSchema), getPatientById);

/**
 * @swagger
 * /api/patients/{id}:
 *   put:
 *     summary: Modifier un patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du patient à modifier
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
 *         description: Patient modifié avec succès
 *       '400':
 *         description: Identifiant ou données invalides
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '404':
 *         description: Patient introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put('/:id', validate(updatePatientSchema), updatePatient);

/**
 * @swagger
 * /api/patients/{id}:
 *   delete:
 *     summary: Supprimer un patient
 *     description: Cette opération est réservée aux administrateurs.
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du patient à supprimer
 *     responses:
 *       '200':
 *         description: Patient supprimé avec succès
 *       '400':
 *         description: Identifiant invalide
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '403':
 *         description: Accès réservé aux administrateurs
 *       '404':
 *         description: Patient introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.delete(
  '/:id',
  requireRole('admin'),
  validate(getPatientSchema),
  deletePatient
);

module.exports = router;
