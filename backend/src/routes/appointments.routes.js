
const express = require('express');

const { authenticateToken } = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');

const {
  createAppointmentSchema,
  listAppointmentsSchema,
  getAppointmentSchema,
  updateAppointmentSchema,
  updateStatusSchema,
} = require('../validators/appointment.validator');

const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
} = require('../controllers/appointments.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rendez-vous
 *   description: Gestion des rendez-vous des patients
 */

// Toutes les routes de ce fichier nécessitent une authentification JWT
router.use(authenticateToken);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Lister les rendez-vous
 *     description: Récupère les rendez-vous avec possibilité de filtrage par date ou statut.
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Liste des rendez-vous récupérée avec succès
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '400':
 *         description: Paramètres de filtrage invalides
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/', validate(listAppointmentsSchema), getAppointments);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Créer un rendez-vous
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Données du rendez-vous conformément aux règles de validation du projet.
 *             additionalProperties: true
 *           example:
 *             patientId: 1
 *             date: "2026-11-05"
 *             status: "scheduled"
 *     responses:
 *       '201':
 *         description: Rendez-vous créé avec succès
 *       '400':
 *         description: Données invalides
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '404':
 *         description: Patient introuvable, si applicable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.post('/', validate(createAppointmentSchema), createAppointment);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Consulter un rendez-vous par son ID
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du rendez-vous
 *     responses:
 *       '200':
 *         description: Rendez-vous récupéré avec succès
 *       '400':
 *         description: Identifiant invalide
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '404':
 *         description: Rendez-vous introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.get('/:id', validate(getAppointmentSchema), getAppointmentById);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Modifier un rendez-vous
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du rendez-vous
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
 *         description: Rendez-vous modifié avec succès
 *       '400':
 *         description: Identifiant ou données invalides
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '404':
 *         description: Rendez-vous introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.put('/:id', validate(updateAppointmentSchema), updateAppointment);

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     summary: Modifier le statut d'un rendez-vous
 *     tags: [Rendez-vous]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Identifiant du rendez-vous
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Nouveau statut conforme au validateur du projet.
 *             additionalProperties: true
 *           example:
 *             status: "confirmed"
 *     responses:
 *       '200':
 *         description: Statut du rendez-vous modifié avec succès
 *       '400':
 *         description: Identifiant ou statut invalide
 *       '401':
 *         description: Authentification absente ou token invalide
 *       '404':
 *         description: Rendez-vous introuvable
 *       '500':
 *         description: Erreur interne du serveur
 */
router.patch(
  '/:id/status',
  validate(updateStatusSchema),
  updateAppointmentStatus
);

module.exports = router;
