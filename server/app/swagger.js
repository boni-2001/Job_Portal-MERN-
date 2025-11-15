// server/app/swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');
const fs = require('fs');

module.exports = (app) => {
  // Where your route files live (adjust if yours are elsewhere)
  const routesGlob = path.join(__dirname, 'routes', '*.js');

  // If the directory doesn't exist (rare), fall back to scanning app folder
  const apis = fs.existsSync(path.join(__dirname, 'routes'))
    ? [routesGlob]
    : [path.join(__dirname, '**', '*.js')];

  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Job Portal API',
        version: '1.0.0',
        description: 'API docs for Job Portal',
      },
      servers: [
        { url: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}` },
      ],
    },
    apis,
  };

  const swaggerSpec = swaggerJsdoc(options);

  // Raw JSON for debugging
  app.get('/api-docs.json', (_req, res) => res.json(swaggerSpec));

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
};
