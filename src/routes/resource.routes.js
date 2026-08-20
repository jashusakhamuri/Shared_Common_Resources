const router = require('express').Router();
const controller = require('../controllers/resource.controller');
const likeController = require('../controllers/like.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get one resource (only if you're a member of its space)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Resource details }
 *       403: { description: Not a member of that space }
 *       404: { description: Not found }
 */
router.get('/:id', controller.getOne);

/**
 * @swagger
 * /resources/{id}/download:
 *   get:
 *     summary: Download the file attached to a resource
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: File stream }
 */
router.get('/:id/download', controller.download);

/**
 * @swagger
 * /resources/{id}/stream:
 *   get:
 *     summary: Stream the file (supports HTTP Range for MP4/MP3 seeking)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: header
 *         name: Range
 *         schema: { type: string, example: "bytes=0-1048575" }
 *     responses:
 *       206: { description: Partial content }
 *       200: { description: Full content }
 */
router.get('/:id/stream', controller.stream);

/**
 * @swagger
 * /resources/{id}/like:
 *   post:
 *     summary: Like or unlike a resource (toggle) — broadcasts the new count live
 *     tags: [Likes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: "{ liked: boolean, likeCount: number }" }
 *       403: { description: Not a member of that space }
 */
router.post('/:id/like', likeController.toggle);

module.exports = router;
