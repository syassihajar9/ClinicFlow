# ClinicFlow | Patient & Appointment Management

**Application web de gestion de patients et de rendez-vous pour une clinique.**

ClinicFlow est une application full-stack conçue pour faciliter la gestion quotidienne d'une clinique grâce à une interface intuitive, une API REST et une base de données relationnelle.

---

## Sommaire

- [Présentation](#-présentation)
- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Captures d'écran](#-captures-décran)
- [Prérequis](#-prérequis)
- [Installation](#-installation-et-lancement)
- [Configuration](#-configuration)
- [Documentation API](#-documentation-de-lapi)
- [Comptes de démonstration](#-comptes-de-démonstration)
- [Sécurité](#-sécurité)
- [Auteur](#-auteur)

## Présentation

ClinicFlow vise à centraliser les principales opérations d'une clinique dans une seule application :

- Gestion des patients et de leurs informations.
- Organisation et suivi des rendez-vous.
- Authentification des utilisateurs et gestion des rôles.
- Consultation des indicateurs d'activité dans un tableau de bord.

Le projet a été réalisé dans le cadre d'un test technique full-stack.

## Fonctionnalités

### Authentification et utilisateurs
- Connexion par email et mot de passe.
- Gestion des rôles Admin et Staff.
- Accès aux fonctionnalités selon les autorisations configurées.

### Gestion des patients
- Création et consultation des dossiers patients.
- Modification des informations.
- Recherche des patients.
- Identification des patients à l'aide de leur CIN, selon les règles de validation de l'application.

### Gestion des rendez-vous
- Création et consultation des rendez-vous.
- Suivi des statuts.
- Gestion des conflits de rendez-vous selon les règles métier implémentées.

### Tableau de bord
- Visualisation des principaux indicateurs.
- Synthèse des informations liées aux patients et aux rendez-vous.

## Technologies

| Technologie | Rôle |
|---|---|
| React | Interface utilisateur |
| JavaScript | Développement frontend |
| Vite | Outil de développement frontend |
| CSS | Mise en forme de l'interface |
| Node.js | Environnement d'exécution backend |
| Express.js | API REST |
| PostgreSQL | Base de données relationnelle |
| JWT | Authentification par jeton, si configurée |
| Docker / Docker Compose | Conteneurisation, si configurée |
| Swagger | Documentation API, si configurée |
| Git / GitHub | Gestion de versions et hébergement |

## Captures d'écran

Ajoute tes captures réelles dans le dossier `screenshots/`, à la racine du projet. Les images s'afficheront ensuite directement sur GitHub.

### Connexion

![Page de connexion ClinicFlow](screenshots/login.png)

### Tableau de bord

![Tableau de bord ClinicFlow](screenshots/dashboard.png)

### Gestion des patients

![Gestion des patients ClinicFlow](screenshots/patients.png)

### Gestion des rendez-vous

![Gestion des rendez-vous ClinicFlow](screenshots/appointments.png)

> Remplace les noms ci-dessus par ceux de tes fichiers réels si nécessaire. Les images ne s'afficheront pas tant qu'elles n'auront pas été ajoutées au dépôt.

## Prérequis

Avant de démarrer le projet, installe :

- [Node.js](https://nodejs.org/)
- npm
- [PostgreSQL](https://www.postgresql.org/), si la base n'est pas fournie par Docker
- [Git](https://git-scm.com/)
- Docker et Docker Compose, si tu utilises le lancement conteneurisé

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/syassihajar9/ClinicFlow.git
cd ClinicFlow
```

### 2. Installer les dépendances

Backend :

```bash
cd backend
npm install
```

Frontend, dans un autre terminal depuis la racine du projet :

```bash
cd frontend
npm install
```

### 3. Configurer l'environnement

Crée un fichier `backend/.env` en respectant les variables attendues par ton code.

Exemple indicatif :

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/clinicflow
JWT_SECRET=replace_with_a_secure_secret
```

Adapte les noms de variables à la configuration réellement utilisée par le projet. Ne publie jamais ton fichier `.env`.

### 4. Préparer la base de données

Crée la base PostgreSQL et exécute les migrations ou scripts SQL prévus dans le projet. Si un script de seed existe, utilise-le pour créer les données de démonstration.

Consulte les scripts de `backend/package.json` pour connaître les commandes exactes.

### 5. Démarrer le backend

Dans un terminal ouvert dans `backend` :

```bash
npm run dev
```

Cette commande suppose que le script `dev` est défini dans `backend/package.json`.

### 6. Démarrer le frontend

Dans un autre terminal, depuis `frontend` :

```bash
npm run dev
```

Ouvre ensuite l'adresse locale affichée dans le terminal, généralement fournie par Vite.

## Configuration Docker

Si Docker Compose est correctement configuré, lance les services depuis la racine du projet :

```bash
docker compose up --build
```

Pour arrêter les services :

```bash
docker compose down
```

## Documentation de l'API

Si Swagger est configuré dans le backend, la documentation interactive peut être disponible à :

[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Vérifie le port et le chemin définis dans ton application.

## Comptes de démonstration

Les comptes doivent exister dans la base de données pour pouvoir être utilisés.

| Rôle | Email |
|---|---|
| Admin | `admin@clinicflow.local` |
| Staff | `staff@clinicflow.local` |

Les mots de passe doivent être communiqués uniquement pour des comptes de démonstration dédiés, sans données réelles ni accès sensibles. Évite de publier les mots de passe directement dans un dépôt public.

## Sécurité

- Ne versionne pas les fichiers `.env`.
- Utilise des données fictives pour les démonstrations.
- Vérifie les autorisations sur les routes protégées.
- Stocke les mots de passe sous forme de hachage sécurisé.
- N'expose aucune clé secrète ni aucun identifiant personnel.

## Auteur

**Hajar Syassi**

- GitHub : [@syassihajar9](https://github.com/syassihajar9)
- Projet : [ClinicFlow](https://github.com/syassihajar9/ClinicFlow)

---

*ClinicFlow — Projet de développement full-stack réalisé dans le cadre d'un test technique.*