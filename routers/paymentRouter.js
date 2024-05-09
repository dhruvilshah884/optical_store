const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');

router.post('/payment', controller.payment);

module.exports = router;
