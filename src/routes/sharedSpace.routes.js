const router = require('express').Router();
const controller = require('../controllers/sharedSpace.controller');
const memberController = require('../controllers/member.controller');
const resourceController = require('../controllers/resource.controller');
const authMiddleware = require('../middleware/auth.middleware');
const authorizationMiddleware = require('../middleware/authorization.middleware');
const upload = require('../middleware/upload.middleware');
const validate = require('../middleware/validation.middleware');
const spaceValidator = require('../validators/sharedSpace.validator');
const memberValidator = require('../validators/member.validator');
const resourceValidator = require('../validators/resource.validator');

router.use(authMiddleware);

/**
 * @swagger
 * /shared-spaces:
 *   post:
 *     summary: Create a new shared space (you become its OWNER)
 *     tags: [Shared Spaces]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, example: Family }
 *               description: { type: string }
 *     responses:
 *       201: { description: Space created }
 *   get:
 *     summary: List every shared space you're a member of
 *     tags: [Shared Spaces]
 *     responses:
 *       200: { description: List of spaces }
 */
router.post('/', validate(spaceValidator.create), controller.create);
router.get('/', controller.listMine);

/**
 * @swagger
 * /shared-spaces/{spaceId}:
 *   get:
 *     summary: Get one shared space
 *     tags: [Shared Spaces]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Space details }
 *       404: { description: Not found }
 *   patch:
 *     summary: Update a shared space (OWNER only)
 *     tags: [Shared Spaces]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Space updated }
 *       403: { description: Not allowed }
 *   delete:
 *     summary: Delete/deactivate a shared space (OWNER only)
 *     tags: [Shared Spaces]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: Space deleted }
 *       403: { description: Not allowed }
 */
router.get('/:spaceId', controller.getOne);
router.patch(
  '/:spaceId',
  authorizationMiddleware('UPDATE_SPACE'),
  validate(spaceValidator.update),
  controller.update
);
router.delete('/:spaceId', authorizationMiddleware('DELETE_SPACE'), controller.remove);

/**
 * @swagger
 * /shared-spaces/{spaceId}/members:
 *   post:
 *     summary: Add a member to a space by email (OWNER only)
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string }
 *               role: { type: string, enum: [OWNER, VIEWER], default: VIEWER }
 *     responses:
 *       201: { description: Member added }
 *       403: { description: Not allowed }
 *       404: { description: No user with that email }
 *   get:
 *     summary: List members of a space
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200: { description: List of members }
 */
router.post(
  '/:spaceId/members',
  authorizationMiddleware('ADD_MEMBER'),
  validate(memberValidator.addMember),
  memberController.add
);
router.get('/:spaceId/members', memberController.list);

/**
 * @swagger
 * /shared-spaces/{spaceId}/members/{userId}:
 *   delete:
 *     summary: Remove a member from a space (OWNER only)
 *     tags: [Members]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Member removed }
 *       403: { description: Not allowed }
 */
router.delete('/:spaceId/members/:userId', authorizationMiddleware('REMOVE_MEMBER'), memberController.remove);

/**
 * @swagger
 * /shared-spaces/{spaceId}/resources:
 *   post:
 *     summary: Create a text resource (a "post") in a space (OWNER only)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *     responses:
 *       201: { description: Resource created, broadcast live to the space over WebSocket }
 *       403: { description: Not allowed }
 *   get:
 *     summary: Get the feed (all resources) of a space
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: offset
 *         schema: { type: integer, default: 0 }
 *     responses:
 *       200: { description: Feed of resources, newest first }
 */
router.post(
  '/:spaceId/resources',
  authorizationMiddleware('CREATE_TEXT'),
  validate(resourceValidator.createText),
  resourceController.createText
);
router.get('/:spaceId/resources', resourceController.feed);

/**
 * @swagger
 * /shared-spaces/{spaceId}/resources/upload:
 *   post:
 *     summary: Upload a file resource (image/video/audio/pdf/zip/etc) to a space (OWNER only)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: spaceId
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file: { type: string, format: binary }
 *               title: { type: string }
 *     responses:
 *       201: { description: File uploaded to local disk storage, metadata saved, broadcast live }
 *       400: { description: Missing file or disallowed file type }
 *       403: { description: Not allowed }
 */
router.post(
  '/:spaceId/resources/upload',
  authorizationMiddleware('UPLOAD_RESOURCE'),
  upload.single('file'),
  resourceController.upload
);

module.exports = router;
