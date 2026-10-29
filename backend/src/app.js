
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

const authRoutes = require('./routes/auth.routes');
const healthRoutes = require('./routes/health.routes');
const testRoutes = require('./routes/test.routes');
const patientsRoutes = require('./routes/patients.routes');
const appointmentsRoutes = require('./routes/appointments.routes');
const usersRoutes = require('./routes/users.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const {
  notFoundHandler,
  errorHandler,
} = require('./middlewares/error.middleware');

const app = express();

// Middlewares globaux
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Documentation Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Route d'accueil
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Bienvenue sur ClinicFlow API !',
  });
});

// Vérification de l'API et de PostgreSQL
app.use('/api/health', healthRoutes);

// Authentification
app.use('/api/auth', authRoutes);

// Routes protégées de test
app.use('/api/test', testRoutes);

// Gestion des patients
app.use('/api/patients', patientsRoutes);

// Gestion des rendez-vous
app.use('/api/appointments', appointmentsRoutes);

// Gestion des utilisateurs
app.use('/api/users', usersRoutes);
// Dashboard - statistiques
app.use('/api/dashboard', dashboardRoutes);

// Gestion des routes inexistantes
app.use(notFoundHandler);

// Gestion centralisée des erreurs : toujours en dernier
app.use(errorHandler);

module.exports = app;
