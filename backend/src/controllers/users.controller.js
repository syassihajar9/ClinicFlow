
const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function createUser(req, res, next) {
  try {
    const { full_name, email, password, role } = req.validated.body;
    const password_hash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, password_hash, role]
    );

    return res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès.',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse e-mail est déjà utilisée.',
      });
    }
    next(error);
  }
}

async function getUsers(req, res, next) {
  try {
    const search = (req.validated.query.search || '').trim();
    const page = Math.max(1, Number.parseInt(req.validated.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(
      1,
      Number.parseInt(req.validated.query.limit, 10) || 10
    ));
    const offset = (page - 1) * limit;
    const pattern = `%${search}%`;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int AS total
       FROM users
       WHERE deleted_at IS NULL
         AND (full_name ILIKE $1 OR email ILIKE $1)`,
      [pattern]
    );

    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at
       FROM users
       WHERE deleted_at IS NULL
         AND (full_name ILIKE $1 OR email ILIKE $1)
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

async function getUserById(req, res, next) {
  try {
    const { id } = req.validated.params;

    const result = await pool.query(
      `SELECT id, full_name, email, role, created_at
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable.',
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

async function updateUser(req, res, next) {
  try {
    const { id } = req.validated.params;
    const fields = req.validated.body;

    const currentResult = await pool.query(
      `SELECT id, full_name, email, role
       FROM users
       WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );

    if (currentResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable.',
      });
    }

    const current = currentResult.rows[0];
    const full_name = fields.full_name ?? current.full_name;
    const email = fields.email ?? current.email;
    const role = fields.role ?? current.role;

    let password_hash;
    if (fields.password) {
      password_hash = await bcrypt.hash(fields.password, 12);
    }

    const result = await pool.query(
      `UPDATE users
       SET full_name = $1,
           email = $2,
           role = $3,
           password_hash = COALESCE($4, password_hash),
           updated_at = NOW()
       WHERE id = $5 AND deleted_at IS NULL
       RETURNING id, full_name, email, role, created_at`,
      [full_name, email, role, password_hash || null, id]
    );

    return res.status(200).json({
      success: true,
      message: 'Utilisateur modifié avec succès.',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse e-mail est déjà utilisée.',
      });
    }
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    const { id } = req.validated.params;

    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte.',
      });
    }

    const result = await pool.query(
      `UPDATE users
       SET deleted_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND deleted_at IS NULL
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Utilisateur supprimé avec succès.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
};
