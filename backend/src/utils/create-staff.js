
require('dotenv').config();

const readline = require('readline');
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  try {
    const fullName = (await ask('Nom complet du staff : ')).trim();
    const email = (await ask('Email du staff : ')).trim().toLowerCase();
    const password = await ask('Mot de passe (8 caractères minimum) : ');

    if (!fullName || !email || password.length < 8) {
      throw new Error('Nom, email et mot de passe valide obligatoires.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'staff')
       RETURNING id, full_name, email, role`,
      [fullName, email, passwordHash]
    );

    console.log('Utilisateur staff créé avec succès :', result.rows[0]);
  } catch (error) {
    console.error('Erreur :', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();
