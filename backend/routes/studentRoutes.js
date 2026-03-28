const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getStudentPerformance } = require('../controller/instructorController');

const router = express.Router();

router.get('/performance', authMiddleware.authenticateToken, getStudentPerformance);

module.exports = router;
