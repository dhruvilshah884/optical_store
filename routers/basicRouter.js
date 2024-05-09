const express = require('express');
const router = express.Router();
const controller = require('../controllers/basicControllers');
const authentication = require('../auth/authentication');


router.get('/', controller.home);
router.get('/about', controller.about);
router.get('/shop',  controller.shop);
router.get('/contact', controller.contact);
router.get('/blog', controller.blogs);
router.get('/addProduct', authentication.Seller , controller.addProduct);
router.get('/view/:id', authentication.User ,  controller.view);
router.get('/cart', authentication.User , controller.cart);
router.get('/checkout', authentication.User, controller.checkout);
router.get('/account', authentication.User, controller.account);
router.get('/myproduct', authentication.User, controller.myProduct);
router.get('/thankyou', authentication.User, controller.thankyou);
router.get('/seller-product', authentication.Seller , controller.sellerProduct);

router.get('/admin', authentication.Admin , controller.admin);
router.get('/report', authentication.Admin , controller.userReport);
router.get('/productreport', authentication.Admin , controller.productReport);
router.get('/contactreport', authentication.Admin , controller.contactReport);
router.get('/contact/view/:id', controller.viewContact);
router.get('/contact/delete/:id', controller.deleteContact);
router.get('/paymentreport', authentication.Admin , controller.paymentReport);
router.get('/delete/payment/:id', controller.deletePaymentRecord);

module.exports = router;
