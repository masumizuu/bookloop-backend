const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { authenticateUser, requireAdmin } = require('../middleware/authMiddleware');

router.use(authenticateUser, requireAdmin); // Protect all admin routes

router.post('/books', bookController.addBook);
router.put('/books/:id', bookController.updateBook);
router.delete('/books/:id', bookController.deleteBook);
router.get('/book-requests', bookController.getBookRequests);
router.put('/book-requests/:id/approve', bookController.approveBookRequest);
router.put('/book-requests/:id/deny', bookController.denyBookRequest);

module.exports = router;