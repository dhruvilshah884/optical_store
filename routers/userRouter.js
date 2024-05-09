const express = require('express');
const router = express.Router();
const controller = require('../controllers/userControllers');
const authentication = require('../auth/authentication');

router.get('/signup', controller.signup);
router.post('/signup', controller.addUser);

router.get('/signup-seller', controller.signupSeller);
router.post('/signup-seller', controller.addSeller);

router.get('/login', controller.login);
router.post('/login', controller.loginPost);

router.get('/forgot-password' , controller.forgotPassword1);

router.post('/forgot-password' , controller.forgotPassword1Post);
router.post('/verifyotp', controller.verifyOTP);

router.get('/logout', controller.logout);
router.get('/delete/user/:id', controller.removeUser);
router.post('/contact', controller.contactUser);
router.post('/addreview', controller.addReview);

module.exports = router;