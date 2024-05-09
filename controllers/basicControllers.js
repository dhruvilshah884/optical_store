const productModel = require('../models/productModel');
const User = require('../models/userModel');
const Payment = require('../models/paymentModel');
const Contect = require('../models/contactModel');

exports.home = async  (req, res) => {
    try {
        let user = req.session.user;
        let productData = await productModel.find({}).limit(8);
        res.render('home', { user: user , data: productData });
    } catch (error) {
        console.log(error);
    }
}

exports.about = (req, res) => {
    let user = req.session.user;
    res.render('aboutUs', { user: user });
}


exports.shop = async (req, res) => {
    try {
        let user = req.session.user;
        let number = parseInt(req.query.number) || 10
        let search = req.query.search || req.query.product_category || "";
        let page = parseInt(req.query.page) || 1; // Parse the page query parameter as an integer with default value 1
        
        let limit = number;

        //search logic
        let product = await productModel.find({
            $or: [
                {product_name: {$regex: search, $options:"i"}},
                {tags: {$regex: search, $options:"i"}}
            ]
        }).limit(limit*1)
        .skip((page-1)*limit)
        .exec();

        //pagination logic
        let count = await productModel.find({
            $or: [
                {product_name: {$regex: search, $options:"i"}}
            ]
        }).countDocuments();

        res.render('shop', { user: user  , product : product , total: Math.ceil(count/limit), page: page }); // Pass the page variable to the EJS template
    } catch (error) {
        console.log(error);
    }
}

exports.contact = (req, res) => {
    let user = req.session.user;
    res.render('contact', { user: user });
}

exports.blogs = (req, res) => {
    let user = req.session.user;
    res.render('blog', { user: user });
}

exports.addProduct = (req, res) => {
    let user = req.session.user;
    res.render('addProduct', { user: user });
}

exports.view = async  (req, res) => {
    try {
        let user = req.session.user;
        let productID = req.params.id;
        let data = await productModel.findById(productID).populate('reviews');
        let reviewInfo = await productModel.find({}).skip(15).limit(6);
        res.render('view', { user: user  , data: data, reviewInfo: reviewInfo});
    } catch (error) {
        console.log(error);
    }
}

exports.cart = async (req, res) => {
    try {
        let user = req.session.user;
        

        const fullData = await User.findById(req.session.user._id).populate({
            path: 'cart',
            populate: {
                path: 'product',
                model: 'Product'
            }
        })

        if(!fullData){
            res.status(500).json({message: "data not found"});
        }

        const cartItem = fullData.cart
        res.render('cart', { user: user , cartItem: cartItem , req: req });
    } catch (error) {
        console.log(error);
    }
    
}


exports.checkout = async (req, res) => {
    try {
        // Retrieve user's cart data from the database
        const user = await User.findById(req.session.user._id).populate('cart.product');

        // If user not found, return an error response
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Extract product details from the user's cart
        const products = user.cart.map(item => ({
            name: item.product.product_name,
            price: item.product.product_price,
            quantity: item.quantity,
            subtotal: item.product.product_price * item.quantity
        }));

        // Calculate subtotal and total prices
        const subtotal = products.reduce((acc, curr) => acc + curr.subtotal, 0);
        const total = subtotal; // You can add taxes, shipping, etc., to calculate the total
        
        // Render the checkout page with the user's cart data
        res.render('checkout', { user: user, products: products, subtotal: subtotal, total: total });
    } catch (error) {
        console.error('Error fetching cart data for checkout:', error);
        res.status(500).json({ message: "Internal server error" });
    }
};


exports.myProduct = async (req, res) => {
    try {
        let user = req.session.user;
        const userId = req.session.user._id;
        const payments = await Payment.find({ userID: userId }).populate('products.productID');
        res.render('myProduct', { payments , user: user});
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};


exports.account = (req,res) => {
    let user = req.session.user;
    res.render('account', { user: user});
}



exports.thankyou = async (req, res) => {
    try {
        const userID = req.session.user._id;
        const paymentStatus = req.query.payment;
        const user = await User.findById(userID);

        if (!user) {
            throw new Error('User not found');
        }

        if (paymentStatus === 'success') {
            // Payment was successful
            // Clear the user's cart here
            if (!user.cart) {
                throw new Error('Cart not found');
            }

            // Clear the user's cart
            user.cart = [];
            
            // Save the updated user with cleared cart
            await user.save();

            res.render('thankyou', { user: user, paymentStatus: 'success' });
        } else if (paymentStatus === 'cancel') {
            // Payment was canceled
            res.render('thankyou', { user: user, paymentStatus: 'cancel' });
        } else {
            // No payment status provided or unknown status
            res.status(400).send('Invalid payment status');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error processing payment');
    }
};







exports.sellerProduct = async (req, res) => {
    try {
        let user = req.session.user;
        const userId = req.session.user._id;
        const products = await productModel.find({ createBy: userId });
        res.render('sellerProduct', { user: user, products: products });
    } catch (error) {
        console.log(error);
    }
}


//admin section
exports.admin = (req,res) => {
    res.render('admin');
}

exports.userReport = async (req,res) => {
    try {
        let search = req.query.search;
        let query = {};

        if (search) {
            query = { role: search };
        }
        const user = await User.find(query);
        const count = await User.find(query).countDocuments();
        
        res.render('userReports', {user: user, count: count});
    } catch (error) {
        console.log(error);
    }
}

exports.productReport = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        let query = {};

       
        if (!startDate && !endDate) {
            query = {}; 
        } else {
            
            if (startDate && endDate) {
                
                endDate = new Date(endDate);
                endDate.setHours(23, 59, 59, 999);
            }

            query.upload_date = {};
            if (startDate) query.upload_date.$gte = new Date(startDate);
            if (endDate) query.upload_date.$lte = endDate;
        }

    
        const products = await productModel.find(query).populate('createBy', 'username');
        const count = await productModel.find(query).populate('createBy', 'username').countDocuments();
        res.render('productReports', { products , count: count});
    } catch (error) {
        console.log(error);
    }
};

exports.contactReport = async (req,res) => {
    try {
        
        const contacts = await Contect.find({});
        const count = await Contect.find({}).countDocuments();
        res.render('contactReport', { contacts: contacts , count: count});
    } catch (error) {
        console.log(error);
    }
}

//view contact data
exports.viewContact = async (req,res) => {
    try {
        const id = req.params.id;
        let data = await Contect.findById(id);
        res.render('viewContact', {data: data});
    } catch (error) {
        console.log(error);
    }
}

//delete contact data
exports.deleteContact = async (req,res) => {
    try {
        const id = req.params.id;
        await Contect.findByIdAndDelete(id);
        res.redirect('/contactreport')        
    } catch (error) {
        console.log(error);
    }
}

// Payment Report
exports.paymentReport = async (req, res) => {
    try {
        let startDate = req.query.startDate;
        let endDate = req.query.endDate;
        let query = {};

        // If startDate and endDate are not provided, fetch all payments
        if (!startDate && !endDate) {
            query = {}; // No need to specify any filter
        } else {
            // Construct query to filter payments within the date range
            if (startDate && endDate) {
                // Adjust endDate to include records up to the end of the day
                endDate = new Date(endDate);
                endDate.setHours(23, 59, 59, 999);
            }

            query.paymentDate = {};
            if (startDate) query.paymentDate.$gte = new Date(startDate);
            if (endDate) query.paymentDate.$lte = endDate;
        }

        // Fetch payments based on the query
        const payments = await Payment.find(query).populate('userID').populate('products.productID');
        const count = await Payment.find(query).populate('userID').populate('products.productID').countDocuments();
        res.render('paymentReport', { payments , count: count});
    } catch (error) {
        console.log(error);
    }
};




//delete payment record
exports.deletePaymentRecord = async (req,res) => {
    try {
        let deleteID = req.params.id;
        await Payment.findByIdAndDelete(deleteID);
        res.redirect('/paymentreport');
    } catch (error) {
        console.log(error);
    }
}



