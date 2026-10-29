
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ClinicFlow API',
      version: '1.0.0',
      description:
        'API de gestion des patients, des rendez-vous et des utilisateurs.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur local ClinicFlow'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.routes.js']
};

module.exports = swaggerJsdoc(options);
