const { Router } = require('express');
const {
  getToken,
  login,
  checkAuth,
} = require('../controllers/auth.controller');

const router = Router();

router.post('/get-token', getToken);
router.post('/login', login);
router.get('/check-auth', checkAuth);

module.exports = router;
