const { Router } = require('express');
const { sendMessageToGroup } = require('../controllers/telegram.controller');
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

const router = new Router();
router.post('/send-message-to-group', authMiddleware, sendMessageToGroup);

module.exports = router;
