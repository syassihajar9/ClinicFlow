
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe obligatoires.',
      });
    }

    const result = await pool.query(
      `SELECT id, full_name, email, password_hash, role
       FROM users
       WHERE LOWER(email) = LOWER($1)
         AND deleted_at IS NULL`,
      [email.trim()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    const user = result.rows[0];

    const passwordIsValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects.',
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET est absent du fichier .env');

      return res.status(500).json({
        success: false,
        message: 'Configuration serveur incomplète.',
      });
    }

    const token = jwt.sign(
      { role: user.role },
      process.env.JWT_SECRET,
      {
        subject: user.id,
        expiresIn: '2h',
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Connexion réussie.',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Erreur de connexion :', error.message);

    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
}

async function me(req, res) {
  try {
    const result = await pool.query(
      `SELECT id, full_name, email, role
       FROM users
       WHERE id = $1
         AND deleted_at IS NULL`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Utilisateur introuvable.',
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(
      'Erreur récupération utilisateur :',
      error.message
    );

    return res.status(500).json({
      success: false,
      message: 'Erreur interne du serveur.',
    });
  }
}

module.exports = { login, me };
