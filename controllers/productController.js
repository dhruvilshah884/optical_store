const multer = require('multer');
const User = require('../models/userModel');
const Product = require('../models/productModel');
let nodemailer = require('nodemailer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});


const upload = multer({ storage: storage });


exports.addProduct = async (req, res) => {
    try {
        let userID = req.session.user._id;
        const email = req.session.user.email;
        upload.fields([{ name: 'product_image1' }, { name: 'product_image2' }, { name: 'product_image3' }, { name: 'seller_brand_logo' },])(req, res, async (err) => {
            if (err) {
                console.error(err);
                return res.status(400).send('Error uploading file');
            }
            try {
                // Extract form data
                const {
                    product_name,
                    product_price,
                    product_star,
                    discount,
                    bank_offer,
                    product_rating,
                    product_quantity,
                    product_sold,
                    product_original_price,
                    return_policy_day,
                    cash_on_delivery,
                    free_delivery,
                    brand_name,
                    frame_colour,
                    frame_size,
                    frame_width,
                    frame_dimensions,
                    frame_shape,
                    category,
                    tags,
                    model_no,
                    item_weight,
                    weight_group,
                    material,
                    prescription_type
                } = req.body;

                // Extract file paths
                const product_image1 = req.files['product_image1'][0].filename;
                const product_image2 = req.files['product_image2'][0].filename;
                const product_image3 = req.files['product_image3'][0].filename;
                const seller_brand_logo = req.files['seller_brand_logo'][0].filename;

                // Create new Product instance
                const newProduct = new Product({
                    product_name,
                    product_price,
                    product_star,
                    discount,
                    bank_offer,
                    product_image1,
                    product_image2,
                    product_image3,
                    seller_brand_logo,
                    product_rating,
                    product_quantity,
                    product_sold,
                    product_original_price,
                    return_policy_day,
                    cash_on_delivery,
                    free_delivery,
                    brand_name,
                    frame_colour,
                    frame_size,
                    frame_width,
                    frame_dimensions,
                    frame_shape,
                    category,
                    tags,
                    model_no,
                    item_weight,
                    weight_group,
                    material,
                    prescription_type,
                    createBy: userID
                });

                // Save the product to the database
                await newProduct.save();

                // Create a Nodemailer transporter using SMTP
                let transporter = nodemailer.createTransport({
                    host: "smtp.gmail.com", // Your SMTP host
                    port: 587, // Your SMTP port
                    secure: false, // Set to true if using SSL
                    auth: {
                        user: "tusharkothiya710@gmail.com", // Your email address
                        pass: "njfe wbwl vbnd kwkc", // Your email password or app password
                    },
                });

                // Mail options
                let mailOptions = {
                    from: 'tusharkothiya710@gmail.com', // Sender address
                    to: email, // List of recipients
                    subject: 'Team Big Bazar', // Subject line
                    text: 'Your ' + product_name + ' Product Added in Our Shop.'// Plain text body
                };

                // Send email
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.log(error);
                        res.send('Error occurred, email not sent.'); // Handle error
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                res.send("data saved");
            } catch (error) {
                console.log(error);
                res.status(500).send('Internal Server Error');
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).send('Internal Server Error');
    }
}

// product add to cart logic here 
exports.addtoCart = async (req,res) => {
    try {

        let {productID} = req.body;

        let user = await User.findById(req.session.user._id);
        
        if(!user){
            res.status(500).json({message: "user not found"});
        }

        const index = user.cart.findIndex(item => item.product.toString() === productID);

        if(index == -1){
            user.cart.push({product:productID, quantity: 1});
        }
        await user.save();
        res.redirect('/cart');
    } catch (error) {
        console.log(error);
    }
}

exports.removeToCart = async (req, res) => {
    try {
        const { productID } = req.body;
        const userID = req.session.user._id;

        // Find the user by ID
        const user = await User.findById(userID);

        // If user not found, return an error response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Filter out the product from the user's cart
        user.cart = user.cart.filter(item => item.product.toString() !== productID);

        await user.save();
        res.redirect('/cart');
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


//increase cart quantity
exports.addCartQuantity = async (req,res) => {
    try {

        const {productID} = req.body;

        let user = await User.findById(req.session.user._id);

        if(!user){
            res.status(404).json({message: "user not found"});
        }

        let index = user.cart.find(item => item.product.toString() === productID);
        index.quantity++;
        await user.save();
        res.redirect('/cart');
    } catch (error) {
        console.log(error);
    }
}

//decrease cart quantity
exports.removeCartQuantity = async (req,res) => {
    try {
        const {productID} = req.body;

        let user = await User.findById(req.session.user._id);

        if(!user){
            res.status(404).json({message: "user not found"});
        }

        let index = user.cart.find(item => item.product.toString() === productID);
        if(index.quantity > 1){
            index.quantity--
        }
        await user.save();
        res.redirect('/cart');

    } catch (error) {
        console.log(errror);
    }
}


//delete products
exports.deleteProduct = async(req,res) => {
    try {
        let productID = req.params.id;
        const product = await Product.findById(productID).populate('createBy', 'email');
        if (!product) {
            return res.status(404).send('Product not found');
        }
        const userEmail = product.createBy.email;
        const product_name = product.product_name;
        
        await Product.findByIdAndDelete(productID);

        //send product removed mail
        // Create a Nodemailer transporter using SMTP
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // Your SMTP host
            port: 587, // Your SMTP port
            secure: false, // Set to true if using SSL
            auth: {
                user: "tusharkothiya710@gmail.com", // Your email address
                pass: "njfe wbwl vbnd kwkc", // Your email password or app password
            },
        });

        // Mail options
        let mailOptions = {
            from: 'tusharkothiya710@gmail.com', // Sender address
            to: userEmail, // List of recipients
            subject: 'Team Big Bazar', // Subject line
            text: 'Your ' + product_name + ' Product Removed in Our Shop.'// Plain text body
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send('Error occurred, email not sent.'); // Handle error
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        if (req.session.user) {
            res.redirect('/seller-product');
        } else {
            res.redirect('/productreport');
        }

    } catch (error) {
        console.log(error);
    }
}

//update product information
exports.updateProduct = async (req,res) => {
    try {
        let productID = req.params.id;
        let data = await Product.findById(productID)
        res.render('productEdit', {data: data});
    } catch (error) {
        console.log(error);
    }
}

exports.updateProductPost = async (req,res) => {
    try {
        let productID = req.params.id;
        const {productNAME, productPRICE, productQTY} = req.body;

        // Check if the product exists
        const product = await Product.findById(productID);
        if (!product) {
            return res.status(404).send("Product not found");
        }

        // Update the product
        await Product.findByIdAndUpdate(productID, {
            product_name: productNAME,
            product_price: productPRICE,
            product_quantity: productQTY
        });

        const productINFO = await Product.findById(productID).populate('createBy', 'email');
        let userEmail = productINFO.createBy.email;

        //send product update mail
        // Create a Nodemailer transporter using SMTP
        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com", // Your SMTP host
            port: 587, // Your SMTP port
            secure: false, // Set to true if using SSL
            auth: {
                user: "tusharkothiya710@gmail.com", // Your email address
                pass: "njfe wbwl vbnd kwkc", // Your email password or app password
            },
        });

        // Mail options
        let mailOptions = {
            from: 'tusharkothiya710@gmail.com', // Sender address
            to: userEmail, // List of recipients
            subject: 'Team Big Bazar', // Subject line
            text: 'Your Product Data Updated Succesfully'// Plain text body
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send('Error occurred, email not sent.'); // Handle error
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        if (req.session.user) {
            res.redirect('/seller-product');
        } else {
            res.redirect('/productreport');
        }
    } catch (error) {
        console.log(error);
    }
}

