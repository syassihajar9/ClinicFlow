
const pool = require('../config/database');

const SELECT_APPOINTMENT = `
  SELECT
    a.id,
    a.patient_id,
    p.full_name AS patient_name,
    a.appointment_date,
    a.status,
    a.reason,
    a.notes,
    a.created_by,
    a.created_at,
    a.updated_at
  FROM appointments a
  INNER JOIN patients p ON p.id = a.patient_id
`;

function conflict(res) {
  return res.status(409).json({
    success: false,
    message:
      'Ce patient a déjà un rendez-vous confirmé dans une fenêtre de 30 minutes.',
  });
}

// Créer un rendez-vous
async function createAppointment(req, res, next) {
  try {
    const {
      patient_id,
      appointment_date,
      reason,
      status,
      notes,
    } = req.validated.body;

    const patient = await pool.query(
      `SELECT id
       FROM patients
       WHERE id = $1 AND deleted_at IS NULL`,
      [patient_id]
    );

    if (patient.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Patient introuvable.',
      });
    }

    const result = await pool.query(
      `INSERT INTO appointments (
         patient_id, appointment_date, reason, status, notes, created_by
       )
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, patient_id, appointment_date, status,
                 reason, notes, created_by, created_at, updated_at`,
      [
        patient_id,
        appointment_date,
        reason,
        status || 'pending',
        notes ?? null,
        req.user.id,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Rendez-vous créé avec succès.',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23P01') return conflict(res);
    return next(error);
  }
}

// Liste des rendez-vous avec filtres optionnels
// GET /api/appointments?date=2026-10-28&status=pending
async function getAppointments(req, res, next) {
  try {
    const { date, status } = req.validated.query;

    const conditions = [
      'a.deleted_at IS NULL',
      'p.deleted_at IS NULL',
    ];
    const values = [];

    if (date) {
      values.push(date);
      conditions.push(
        `(a.appointment_date AT TIME ZONE 'Africa/Casablanca')::date = $${values.length}::date`
      );
    }

    if (status) {
      values.push(status);
      conditions.push(`a.status = $${values.length}`);
    }

    const result = await pool.query(
      `${SELECT_APPOINTMENT}
       WHERE ${conditions.join(' AND ')}
       ORDER BY a.appointment_date ASC`,
      values
    );

    return res.status(200).json({
      success: true,
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    return next(error);
  }
}

// Récupérer un rendez-vous par son ID
async function getAppointmentById(req, res, next) {
  try {
    const { id } = req.validated.params;

    const result = await pool.query(
      `${SELECT_APPOINTMENT}
       WHERE a.id = $1
         AND a.deleted_at IS NULL
         AND p.deleted_at IS NULL`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
}

// Modifier un rendez-vous
// PUT /api/appointments/:id
async function updateAppointment(req, res, next) {
  try {
    const { id } = req.validated.params;
    const updates = req.validated.body;

    const existing = await pool.query(
      `SELECT id
       FROM appointments
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable.',
      });
    }

    if (updates.patient_id !== undefined) {
      const patient = await pool.query(
        `SELECT id
         FROM patients
         WHERE id = $1 AND deleted_at IS NULL`,
        [updates.patient_id]
      );

      if (patient.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: 'Patient introuvable.',
        });
      }
    }

    const allowedFields = [
      'patient_id',
      'appointment_date',
      'reason',
      'status',
      'notes',
    ];

    const values = [];
    const setClauses = [];

    for (const field of allowedFields) {
      if (Object.prototype.hasOwnProperty.call(updates, field)) {
        values.push(updates[field]);
        setClauses.push(`${field} = $${values.length}`);
      }
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE appointments
       SET ${setClauses.join(', ')},
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $${values.length}
         AND deleted_at IS NULL
       RETURNING id, patient_id, appointment_date, status,
                 reason, notes, created_by, created_at, updated_at`,
      values
    );

    return res.status(200).json({
      success: true,
      message: 'Rendez-vous modifié avec succès.',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23P01') return conflict(res);
    return next(error);
  }
}

// Modifier uniquement le statut
// PATCH /api/appointments/:id/status
async function updateAppointmentStatus(req, res, next) {
  try {
    const { id } = req.validated.params;
    const { status } = req.validated.body;

    const result = await pool.query(
      `UPDATE appointments
       SET status = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
         AND deleted_at IS NULL
       RETURNING id, patient_id, appointment_date, status,
                 reason, notes, created_by, created_at, updated_at`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Rendez-vous introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Statut mis à jour avec succès.',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23P01') return conflict(res);
    return next(error);
  }
}

module.exports = {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointment,
  updateAppointmentStatus,
};
