const express = require('express');
const router = express.Router();
const savedController = require('../controllers/savedController');
const { authenticateUser } = require('../middleware/authMiddleware');

router.get('/:userId', authenticateUser, savedController.getSavedList);
router.post('/add', authenticateUser, savedController.saveBook);
router.delete('/remove', authenticateUser, savedController.removeBookFromSaved);

module.exports = router;
