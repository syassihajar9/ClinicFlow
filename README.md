# ClinicFlow | Patient & Appointment Management

**Application web de gestion de patients et de rendez-vous pour une clinique.**

ClinicFlow est une application full-stack conçue pour faciliter la gestion quotidienne d'une clinique grâce à une interface intuitive, une API REST et une base de données relationnelle.

---

## Sommaire

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Technologies](#technologies)
- [Captures d'écran](#captures-décran)
- [Architecture et conception UML](#architecture-et-conception-uml)
- [Prérequis](#prérequis)
- [Installation et lancement](#installation-et-lancement)
- [Configuration](#configuration)
- [Configuration Docker](#configuration-docker)
- [Documentation de l'API](#documentation-de-lapi)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Sécurité](#sécurité)
- [Auteur](#auteur)

---

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
- Contrôle des accès selon les autorisations configurées.

### Gestion des patients

- Création et consultation des dossiers patients.
- Modification des informations.
- Recherche des patients.
- Identification des patients à l'aide de leur CIN, selon les règles de validation implémentées.

### Gestion des rendez-vous

- Création et consultation des rendez-vous.
- Suivi des statuts.
- Gestion des conflits de rendez-vous selon les règles métier implémentées.

### Tableau de bord

- Visualisation des principaux indicateurs.
- Synthèse des informations relatives aux patients et aux rendez-vous.

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
| Swagger | Documentation de l'API, si configurée |
| Git / GitHub | Gestion de versions et hébergement |

---

## Captures d'écran

Cette section présente les principales interfaces de ClinicFlow.

### 1. Page de connexion

![Page de connexion ClinicFlow](screenshots/login.png)

### 2. Tableau de bord

![Tableau de bord ClinicFlow](screenshots/dash.png)

### 3. Gestion des patients

![Gestion des patients ClinicFlow](screenshots/pt.png)

### 4. Gestion des rendez-vous

![Gestion des rendez-vous ClinicFlow](screenshots/rdv.png)

---

## Architecture et conception UML

Cette section regroupe les diagrammes de conception de ClinicFlow et les captures des outils techniques utilisés.

### 1. Docker et Docker Compose

Présentation de la configuration de conteneurisation et des services de l'application.

![Configuration Docker ClinicFlow](screenshots/docker.png)

### 2. Documentation API Swagger

Présentation des endpoints de l'API REST et de leur documentation interactive, si Swagger est configuré.

![Documentation Swagger ClinicFlow](screenshots/swaguer.png)

### 3. Diagramme entité-relation (ERD)

Le diagramme ERD présente les principales entités de la base de données PostgreSQL et leurs relations.

![Diagramme ERD ClinicFlow](screenshots/ERD.png)

### 4. Diagramme de cas d'utilisation (Use Case)

Ce diagramme représente les interactions entre les acteurs Admin et Staff et les fonctionnalités de ClinicFlow.

![Diagramme de cas d'utilisation ClinicFlow](screenshots/2.png)

### 5. Diagramme d'activité

Ce diagramme illustre le déroulement d'un processus métier, par exemple la création d'un rendez-vous.

![Diagramme d'activité ClinicFlow](screenshots/6.png)

### 6. Diagrammes de séquence UML

#### 6.1. Séquence d'authentification

Ce diagramme illustre les échanges entre l'utilisateur, l'interface, l'API et la base de données lors de la connexion, selon l'architecture réellement implémentée.

![Diagramme de séquence d'authentification](screenshots/3.png)

#### 6.2. Séquence de gestion des rendez-vous

Ce diagramme représente les échanges lors de la création d'un rendez-vous.

![Diagramme de séquence des rendez-vous](screenshots/4.png)

### 7. Diagramme de classes UML

Ce diagramme représente les principales classes métier, leurs attributs et leurs associations.

![Diagramme de classes UML ClinicFlow](screenshots/1.png)

---

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

### 2. Installer les dépendances du backend

```bash
cd backend
npm install
```

### 3. Installer les dépendances du frontend

Ouvre un autre terminal à la racine du projet :

```bash
cd frontend
npm install
```

### 4. Configurer l'environnement

Crée un fichier `backend/.env` en respectant les variables réellement utilisées par ton code.

Exemple indicatif :

```env
PORT=5000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/clinicflow
JWT_SECRET=replace_with_a_secure_secret
```

Adapte les noms des variables à la configuration de ton application.

**Important :** ne publie jamais le fichier `.env` sur GitHub.

### 5. Préparer la base de données

Crée la base PostgreSQL et exécute les migrations ou scripts SQL prévus dans le projet.

Si un script de seed est disponible, utilise-le pour créer les données de démonstration.

Consulte `backend/package.json` pour connaître les commandes réellement définies.

### 6. Démarrer le backend

Dans un terminal ouvert dans `backend` :

```bash
npm run dev
```

Cette commande suppose que le script `dev` existe dans `backend/package.json`.

### 7. Démarrer le frontend

Dans un autre terminal ouvert dans `frontend` :

```bash
npm run dev
```

Ouvre ensuite l'adresse locale indiquée dans le terminal par Vite.

---

## Configuration Docker

Si le projet possède un fichier `compose.yaml` ou `docker-compose.yml` correctement configuré, lance les services depuis la racine du dépôt :

```bash
docker compose up --build
```

Pour arrêter les services :

```bash
docker compose down
```

Ces commandes ne fonctionnent que si la configuration Docker nécessaire est présente.

---

## Documentation de l'API

Si Swagger est configuré, la documentation interactive peut être accessible à l'adresse suivante :

[http://localhost:5000/api-docs](http://localhost:5000/api-docs)

Vérifie le port et le chemin réellement définis dans le backend.

---

## Comptes de démonstration

Les comptes suivants sont destinés aux tests de ClinicFlow.

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@clinicflow.local` | `ClinicFlowAdmin2026!` |
| Staff | `staff@clinicflow.local` | `SY2003assi@` |

**Important :**

- Les comptes doivent exister dans la base de données.
- Les mots de passe doivent être stockés sous forme de hachage sécurisé côté backend.
- Les identifiants ne fonctionneront que si les comptes correspondants ont été créés et que l'authentification est correctement configurée.
- Utilise uniquement des données fictives pour les démonstrations.
- Évite de publier ces mots de passe si le dépôt est public ou si les identifiants sont réutilisés ailleurs.

## Sécurité

- Ne versionne pas les fichiers `.env`.
- Utilise des données fictives pour les démonstrations.
- Vérifie les autorisations sur les routes protégées.
- Stocke les mots de passe sous forme de hachage sécurisé.
- Protège les routes réservées au rôle Admin.
- Valide les données reçues par l'API.
- N'expose aucune clé secrète ni aucune donnée personnelle.
- Utilise des identifiants spécifiques aux démonstrations.

---

## Auteur

**Hajar Syassi**

- GitHub : [@syassihajar9](https://github.com/syassihajar9)
- Projet : [ClinicFlow](https://github.com/syassihajar9/ClinicFlow)

---

*ClinicFlow — Projet de développement full-stack réalisé dans le cadre d'un test technique.*
