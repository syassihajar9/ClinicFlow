\# ClinicFlow — Gestion des patients et des rendez-vous



\## Présentation du projet



ClinicFlow est une application web de gestion destinée à une petite clinique. Elle permet de gérer les patients, les rendez-vous et les utilisateurs, et de consulter un tableau de bord récapitulatif.



\## Fonctionnalités principales



\- Authentification par email et mot de passe.

\- Gestion des rôles Admin et Staff.

\- Gestion des patients.

\- Gestion des rendez-vous et de leurs statuts.

\- Tableau de bord avec indicateurs clés.

\- API REST et base de données PostgreSQL.



\## Technologies utilisées



\- \*\*Frontend :\*\* React, JavaScript, Vite, CSS.

\- \*\*Backend :\*\* Node.js, Express.js.

\- \*\*Base de données :\*\* PostgreSQL.

\- \*\*Authentification :\*\* JWT, si configuré.

\- \*\*Conteneurisation :\*\* Docker et Docker Compose, si configurés.

\- \*\*Documentation API :\*\* Swagger, si configuré.

\- \*\*Versionnement :\*\* Git et GitHub.



\## Installation



\### 1. Cloner le projet



```bash

git clone https://github.com/syassihajar9/ClinicFlow.git

cd ClinicFlow

```



\### 2. Installer les dépendances du backend



```bash

cd backend

npm install

```



\### 3. Configurer les variables d'environnement



Créer le fichier `backend/.env` selon la configuration du projet. Exemple :



```env

PORT=5000

DATABASE\_URL=postgresql://USER:PASSWORD@localhost:5432/clinicflow

JWT\_SECRET=replace\_with\_a\_secure\_secret

```



Remplacer les valeurs d'exemple par les paramètres de ton environnement local. Ne pas publier le fichier `.env`.



\### 4. Démarrer le backend



Depuis le dossier `backend`, si le script `dev` existe dans `package.json` :



```bash

npm run dev

```



\### 5. Démarrer le frontend



Dans un nouveau terminal :



```bash

cd frontend

npm install

npm run dev

```



Ouvrir l'adresse locale affichée par Vite.



\### 6. Docker



Si le fichier Docker Compose est correctement configuré, lancer à la racine du projet :



```bash

docker compose up --build

```



Pour arrêter les conteneurs :



```bash

docker compose down

```



\## Documentation de l'API



Si Swagger est configuré, consulter :



http://localhost:5000/api-docs



Vérifier le port et le chemin dans la configuration du backend.



\## Comptes de démonstration



Utiliser uniquement les comptes de test réellement configurés dans la base de données.



| Rôle | Email | Mot de passe |

|---|---|---|

| Admin | `admin@clinicflow.local` | ClinicFlowAdmin2026! |

| Staff | `staff@clinicflow.local` | SY2003assi@|



Les mots de passe ne doivent être publiés que s'il s'agit de comptes dédiés à la démonstration, sans accès à des données réelles. Ne jamais réutiliser de mot de passe personnel.



\## Sécurité



\- Ne pas publier les fichiers `.env`.

\- Protéger les routes selon les rôles des utilisateurs.

\- Utiliser des données fictives pour les démonstrations.

\- Ne pas exposer de clés secrètes.



\## Auteur



\*\*Hajar Syassi\*\*



GitHub : https://github.com/syassihajar9



\---



Projet réalisé dans le cadre d'un test technique — ClinicFlow.

