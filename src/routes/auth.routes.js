const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const validate = require('../middleware/validation.middleware');
const validator = require('../validators/auth.validator');
const { authLimiter } = require('../middleware/rateLimit.middleware');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string, example: Jashu }
 *               email: { type: string, example: jashu@example.com }
 *               password: { type: string, example: password123 }
 *     responses:
 *       201: { description: User created }
 *       409: { description: Email already registered }
 */
router.post('/register', authLimiter, validate(validator.register), controller.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in and receive access + refresh tokens
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: Login successful, returns accessToken + refreshToken }
 *       401: { description: Invalid credentials }
 */
router.post('/login', authLimiter, validate(validator.login), controller.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Exchange a refresh token for a new access token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: New access token issued }
 *       401: { description: Invalid or expired refresh token }
 */
router.post('/refresh', validate(validator.refresh), controller.refresh);

module.exports = router;
