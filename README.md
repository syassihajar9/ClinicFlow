# ClinicFlow | Patient & Appointment Management

**Application web de gestion de patients et de rendez-vous pour une clinique.**

ClinicFlow est une application full-stack conçue pour faciliter la gestion quotidienne d'une clinique grâce à une interface intuitive, une API REST et une base de données relationnelle.

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Captures d'écran](#captures-décran)
- [Prérequis](#prérequis)
- [Installation](#installation-et-lancement)
- [Configuration](#configuration)
- [Documentation API](#documentation-de-lapi)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Sécurité](#sécurité)
- [Auteur](#auteur)

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

Ajoute tes captures d'écran réelles dans le dossier `screenshots/`, à la racine du projet.

### Page de connexion

![Page de connexion ClinicFlow](screenshots/login.png)

### Tableau de bord

![Tableau de bord ClinicFlow](screenshots/dash.png)

### Gestion des patients

![Gestion des patients ClinicFlow](screenshots/pt.png)

### Gestion des rendez-vous

![Gestion des rendez-vous ClinicFlow](screenshots/rdv.png)

**Remarque :** les fichiers images doivent exister dans le dossier `screenshots/`. Remplace les noms ci-dessus par ceux de tes captures réelles si nécessaire.

## Prérequis

Avant de démarrer le projet, installe :

- [Node.js](https://nodejs.org/)
- npm
- [PostgreSQL](https://www.postgresql.org/), si la base de données n'est pas fournie par Docker
- [Git](https://git-scm.com/)
- Docker et Docker Compose, si tu utilises le lancement conteneurisé

## Installation et lancement

### 1. Cloner le dépôt

```bash
git clone https://github.com/syassihajar9/ClinicFlow.git
cd ClinicFlow
```

### 2. Installer les dépendances

**Backend :**

```bash
cd backend
npm install
```

**Frontend :**

Dans un autre terminal, depuis le dossier racine du projet :

```bash
cd frontend
npm install
```

### 3. Configuration de l'environnement

Crée un fichier `backend/.env` en respectant les variables attendues par ton code.

Exemple indicatif :

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/clinicflow
JWT_SECRET=replace_with_a_secure_secret
```

Adapte les noms des variables à la configuration réellement utilisée par le projet.

**Important :** ne publie jamais ton fichier `.env` sur GitHub.

### 4. Préparer la base de données

Crée la base de données PostgreSQL et exécute les migrations ou scripts SQL prévus dans le projet.

Si un script de seed existe, utilise-le pour créer les données de démonstration.

Consulte les scripts définis dans `backend/package.json` pour connaître les commandes exactes.

### 5. Démarrer le backend

Dans un terminal ouvert dans le dossier `backend` :

```bash
npm run dev
```

Cette commande suppose que le script `dev` est défini dans `backend/package.json`.

### 6. Démarrer le frontend

Dans un autre terminal ouvert dans le dossier `frontend` :

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

Ces commandes supposent qu'un fichier `compose.yaml` ou `docker-compose.yml` est présent à la racine du projet.

## Documentation de l'API

Si Swagger est configuré dans le backend, la documentation interactive peut être disponible à l'adresse suivante :

[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Vérifie le port et le chemin définis dans ton application.

## Comptes de démonstration

Les comptes suivants sont destinés aux tests de l'application ClinicFlow.

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@clinicflow.local` | `ClinicFlowAdmin2026!` |
| Staff | `staff@clinicflow.local` | `SY2003assi@` |

**Important :**

- Ces comptes doivent avoir été créés dans la base de données.
- Les mots de passe doivent être stockés sous forme de hachage sécurisé côté backend.
- Les identifiants ci-dessus ne fonctionnent que si les comptes correspondants existent et que l'authentification est correctement configurée.
- Utilise uniquement des données fictives pour les démonstrations.

## Sécurité

- Ne versionne pas les fichiers `.env`.
- Utilise des données fictives pour les démonstrations.
- Vérifie les autorisations sur les routes protégées.
- Stocke les mots de passe sous forme de hachage sécurisé.
- Protège les routes réservées au rôle Admin.
- Valide les données reçues par l'API.
- N'expose aucune clé secrète ni aucun identifiant personnel.
- Évite de publier des mots de passe réutilisés dans un dépôt public.

## Auteur

**Hajar Syassi**

- GitHub : [@syassihajar9](https://github.com/syassihajar9)
- Projet : [ClinicFlow](https://github.com/syassihajar9/ClinicFlow)

---

*ClinicFlow — Projet de développement full-stack réalisé dans le cadre d'un test technique.*
