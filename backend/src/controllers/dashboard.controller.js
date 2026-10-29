
const pool = require('../config/database');

async function getDashboardStats(req, res, next) {
  try {
    const result = await pool.query(`
      SELECT
        (
          SELECT COUNT(*)
          FROM patients
          WHERE deleted_at IS NULL
        )::int AS total_patients,

        (
          SELECT COUNT(*)
          FROM appointments
          WHERE deleted_at IS NULL
            AND (appointment_date AT TIME ZONE 'Africa/Casablanca')::date
                = (CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Casablanca')::date
        )::int AS appointments_today,

        (
          SELECT COUNT(*)
          FROM appointments
          WHERE deleted_at IS NULL
            AND status = 'pending'
        )::int AS pending_appointments,

        (
          SELECT COUNT(*)
          FROM appointments
          WHERE deleted_at IS NULL
            AND status = 'confirmed'
        )::int AS confirmed_appointments
    `);

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = { getDashboardStats };
