const { Router } = require('express');
const {
  createTeacherGroup,
  createTeacherSubGroup,
  getGroups,
  getAllGroups,
  deleteStudent,
  renameGroup,
  getGroup,
} = require('../controllers/option.controller');
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware');
const roleMiddleware = require('../middleware/role.middleware');

router.post(
  '/create-teacher-group',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  createTeacherGroup
);
router.post(
  '/create-teacher-sub-group',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  createTeacherSubGroup
);
router.post(
  '/get-groups',
  authMiddleware,
  roleMiddleware(['ADMIN', 'USER']),
  getGroups
);
router.get(
  '/get-all-groups',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  getAllGroups
);

router.post(
  '/delete-student',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  deleteStudent
);
router.post(
  '/rename-group',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  renameGroup
);

router.get('/get-group/:_id', getGroup);

module.exports = router;
