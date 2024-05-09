const stripe = require('stripe')('sk_test_51P93FaSFBSE2XlqfIyzlbiIt1dI5Igxf3oUV9ycRwMptVFuXl99bb7NfQVG0ShCMoLqjXzaaqgkkcOCSwNBfbwtW00Dyx7zxLU');
const Payment = require('../models/paymentModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');

exports.payment = async (req, res) => {
    try {
        const { userID, amount, email, products, productQuantities } = req.body;

        // Fetch user's cart products
        const user = await User.findById(userID).populate('cart.product');
        const cartProducts = user.cart.map(item => ({
            productID: item.product._id,
            quantity: item.quantity,
        }));

        // Update product quantities and sold counts
        for (let i = 0; i < products.length; i++) {
            const productID = products[i];
            const purchasedQuantity = productQuantities[i];
            const product = await Product.findById(productID);

            if (!product) {
                throw new Error('Product not found');
            }

            if (product.product_quantity < purchasedQuantity) {
                throw new Error('Insufficient product quantity');
            }

            // Decrease product quantity count
            product.product_quantity -= purchasedQuantity;
            

            await product.save();
        }

        const line_items = products.map((productID, index) => {
            const product = user.cart.find(item => item.product._id.toString() === productID.toString()).product;
            return {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: product.product_name,
                    },
                    unit_amount: parseInt(product.product_price) * 100,
                },
                quantity: productQuantities[index],
            };
        });

        // Create a new payment session with Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: 'http://localhost:3000/thankyou?payment=success', // Add payment success query parameter
            cancel_url: 'http://localhost:3000?payment=cancel', // Add payment cancel query parameter
            customer_email: email,
        });

        // Create a new payment document and save it
        const payment = new Payment({
            userID: userID,
            amount: amount,
            products: cartProducts,
        });
        await payment.save();

        // Redirect the user to the payment session URL
        res.redirect(session.url);

    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing payment');
    }
};
