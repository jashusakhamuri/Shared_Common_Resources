const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const env = require('./config/env');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(helmet({ contentSecurityPolicy: false })); // CSP relaxed so the demo UI in /public can run inline JS
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public'))); // serves the simple demo UI at /

// Swagger docs — mandatory, always on
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/shared-spaces', require('./routes/sharedSpace.routes'));
app.use('/api/v1/resources', require('./routes/resource.routes'));

app.get('/api/v1/health', (req, res) => res.json({ success: true, data: { status: 'ok' } }));

// 404 fallback for unknown API routes
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Not found' }));

// Error handler — always last
app.use(errorMiddleware);

module.exports = app;
