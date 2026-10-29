
const pool = require('../config/database');

// Créer un patient
async function createPatient(req, res, next) {
  try {
    const {
      full_name,
      cin,
      phone,
      birth_date,
      address,
    } = req.validated.body;

    const result = await pool.query(
      `INSERT INTO patients
        (full_name, cin, phone, birth_date, address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, full_name, cin, phone, birth_date, address, created_at`,
      [full_name, cin, phone, birth_date, address || null]
    );

    return res.status(201).json({
      success: true,
      message: 'Patient créé avec succès.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// Lister les patients avec recherche et pagination
async function getPatients(req, res, next) {
  try {
    const search = (req.query.search || '').trim();
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, Number.parseInt(req.query.limit, 10) || 10)
    );
    const offset = (page - 1) * limit;
    const pattern = `%${search}%`;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM patients
       WHERE deleted_at IS NULL
         AND (full_name ILIKE $1 OR cin ILIKE $1)`,
      [pattern]
    );

    const result = await pool.query(
      `SELECT id, full_name, cin, phone, birth_date, address, created_at
       FROM patients
       WHERE deleted_at IS NULL
         AND (full_name ILIKE $1 OR cin ILIKE $1)
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [pattern, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total: countResult.rows[0].total,
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
}

// Consulter un patient par son UUID
async function getPatientById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, full_name, cin, phone, birth_date, address, created_at
       FROM patients
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// Modifier un patient
async function updatePatient(req, res, next) {
  try {
    const { id } = req.params;
    const {
      full_name,
      cin,
      phone,
      birth_date,
      address,
    } = req.validated.body;

    const result = await pool.query(
      `UPDATE patients
       SET full_name = $1,
           cin = $2,
           phone = $3,
           birth_date = $4,
           address = $5,
           updated_at = NOW()
       WHERE id = $6 AND deleted_at IS NULL
       RETURNING id, full_name, cin, phone, birth_date, address, created_at`,
      [full_name, cin, phone, birth_date, address || null, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Patient modifié avec succès.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
}

// Suppression logique : la route sera réservée à admin
async function deletePatient(req, res, next) {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `UPDATE patients
       SET deleted_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Patient supprimé avec succès.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};
