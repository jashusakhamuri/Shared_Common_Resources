const swaggerJSDoc = require('swagger-jsdoc');

// Swagger is mandatory in this project — every route file under
// src/routes/*.js must carry a `@swagger` JSDoc block, and this file turns
// all of those comments into one live spec served at /api-docs.

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Shared Resource Platform API',
      version: '1.0.0',
      description:
        'Local-only shared-space / resource-sharing backend. ' +
        'PostgreSQL for metadata, local disk for files, WebSocket for the live feed.',
    },
    servers: [
      { url: '/api/v1', description: 'Local server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Every route file gets scanned for @swagger comment blocks
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJSDoc(options);
