const express = require('express');
const router = express.Router();
const controller = require('../controllers/productController');


router.post('/addProduct', controller.addProduct);
router.post('/addtocart', controller.addtoCart);
router.post('/removeProduct', controller.removeToCart);

router.post('/increase', controller.addCartQuantity);
router.post('/decrease', controller.removeCartQuantity);

router.get('/delete/:id',  controller.deleteProduct);
router.get('/edit/:id',   controller.updateProduct);
router.post('/edit/:id', controller.updateProductPost);


module.exports = router;