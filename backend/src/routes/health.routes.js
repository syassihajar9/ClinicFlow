
const express = require('express');
const pool = require('../config/database');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Santé de l'API
 *   description: Vérification de l'état de l'API et de PostgreSQL
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Vérifier l'état de l'API et de PostgreSQL
 *     description: >
 *       Vérifie que l'API répond et qu'une requête vers PostgreSQL
 *       peut être exécutée.
 *     tags: [Santé de l'API]
 *     responses:
 *       '200':
 *         description: L'API et PostgreSQL fonctionnent correctement
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
 *                   example: ClinicFlow API et PostgreSQL fonctionnent correctement
 *                 database:
 *                   type: string
 *                   example: clinicflow
 *                 databaseTime:
 *                   type: string
 *                   format: date-time
 *       '500':
 *         description: Impossible de se connecter à la base de données
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Impossible de se connecter à la base de données
 */
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT NOW() AS database_time, current_database() AS database_name'
    );

    res.status(200).json({
      success: true,
      message: 'ClinicFlow API et PostgreSQL fonctionnent correctement',
      database: result.rows[0].database_name,
      databaseTime: result.rows[0].database_time,
    });
  } catch (error) {
    console.error('Erreur de connexion PostgreSQL :', error.message);

    res.status(500).json({
      success: false,
      message: 'Impossible de se connecter à la base de données',
    });
  }
});

module.exports = router;
