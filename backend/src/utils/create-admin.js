
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
    const fullName = (await ask('Nom complet : ')).trim();
    const email = (await ask('Email : ')).trim().toLowerCase();
    const password = await ask('Mot de passe (8 caractères minimum) : ');

    if (!fullName || !email || password.length < 8) {
      throw new Error('Informations invalides. Vérifie les champs.');
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'admin')
       RETURNING id, full_name, email, role`,
      [fullName, email, passwordHash]
    );

    console.log('Utilisateur créé avec succès :', result.rows[0]);
  } catch (error) {
    console.error('Erreur :', error.message);
  } finally {
    rl.close();
    await pool.end();
  }
}

main();
