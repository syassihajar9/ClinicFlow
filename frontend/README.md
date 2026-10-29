# ClinicFlow — Gestion des patients et des rendez-vous

## Présentation du projet

ClinicFlow est une application web destinée à faciliter la gestion d'une petite clinique. Elle permet de gérer les patients, les rendez-vous et les utilisateurs, tout en offrant un tableau de bord pour suivre les principales informations de l'activité.

Ce projet a été réalisé dans le cadre d'un test technique.

## Fonctionnalités principales

- Authentification par email et mot de passe.
- Gestion des rôles Admin et Staff.
- Gestion des patients : création, consultation, modification et recherche.
- Gestion des rendez-vous et de leurs statuts.
- Tableau de bord avec indicateurs clés.
- API REST pour la communication entre le frontend et le backend.
- Base de données relationnelle pour stocker les informations.

## Technologies utilisées

| Technologie | Utilisation |
|---|---|
| React | Développement de l'interface utilisateur |
| JavaScript | Programmation frontend |
| Node.js | Environnement d'exécution backend |
| Express.js | Développement de l'API REST |
| PostgreSQL | Gestion de la base de données relationnelle |
| JWT | Authentification par jeton |
| Docker | Conteneurisation de l'application |
| Docker Compose | Orchestration des services |
| Swagger | Documentation de l'API |
| Git | Gestion des versions |
| GitHub | Hébergement du code source |

## Prérequis

Avant de lancer l'application, installer :

- Node.js
- npm
- PostgreSQL, si la base de données n'est pas lancée avec Docker
- Git
- Docker et Docker Compose, si utilisés

## Installation et configuration

### 1. Cloner le dépôt

```bash
git clone https://github.com/syassihajar9/ClinicFlow.git
cd ClinicFlow
```

### 2. Installer les dépendances du backend

```bash
cd backend
npm install
```

### 3. Configurer les variables d'environnement

Créer un fichier `.env` dans le dossier `backend`, en s'appuyant sur `.env.example` s'il existe.

Exemple de configuration :

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/clinicflow
JWT_SECRET=replace_with_a_secure_secret
```

Remplacer les valeurs d'exemple par celles de ton environnement local. Ne jamais publier les véritables mots de passe ou clés secrètes sur GitHub.

### 4. Préparer la base de données

Créer la base PostgreSQL `clinicflow`, puis exécuter les migrations et le script de seed prévus par le projet, s'ils existent.

Consulter `backend/package.json` pour connaître les commandes disponibles.

### 5. Démarrer le backend

Depuis le dossier `backend`, exécuter le script de démarrage défini dans `package.json`. Si le script `dev` existe :

```bash
npm run dev
```

### 6. Installer et démarrer le frontend

Ouvrir un deuxième terminal à la racine du projet :

```bash
cd frontend
npm install
npm run dev
```

Ouvrir ensuite l'adresse locale indiquée dans le terminal.

## Lancement avec Docker

Si `docker-compose.yml` est configuré pour démarrer tous les services nécessaires, exécuter cette commande à la racine du projet :

```bash
docker compose up --build
```

Pour arrêter les conteneurs :

```bash
docker compose down
```

## Documentation de l'API

Si Swagger est configuré dans le backend, la documentation interactive peut être accessible à l'adresse suivante :

[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Vérifier le port et le chemin réellement configurés dans le projet.

## Comptes de démonstration

Ces identifiants sont destinés aux tests et doivent correspondre aux comptes effectivement créés dans la base de données.

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur (Admin) | `admin@clinicflow.local` | `ClinicFlowAdmin2026!` |
| Personnel (Staff) | `staff@clinicflow.local` | `SY2003assi@` |

**Important :** si le dépôt GitHub est public, assure-toi que ces comptes sont réservés à la démonstration, qu'ils utilisent uniquement des données fictives et que leurs mots de passe ne sont réutilisés nulle part ailleurs.

## Sécurité

- Ne pas publier le fichier `.env`.
- Ne jamais exposer de clés secrètes ou de mots de passe personnels.
- Vérifier les autorisations selon le rôle de l'utilisateur.
- Utiliser des données fictives pour les démonstrations.
- Conserver les fichiers de configuration sensibles hors du dépôt Git.

## Auteur

**Hajar Syassi**

GitHub : [syassihajar9](https://github.com/syassihajar9)

---

Projet réalisé dans le cadre d'un test technique — ClinicFlow.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
