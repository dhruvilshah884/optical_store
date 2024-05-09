// generate random number 
function generateRandomNumber() {
    return Math.floor(100000 + Math.random() * 900000);
}


let UserModel = require('../models/userModel');
let Admin = require('../models/adminModel');
let bcrypt = require('bcryptjs');
let token = require('jsonwebtoken');
let nodemailer = require('nodemailer');
const notifier = require('node-notifier');
let Contact = require('../models/contactModel');
const Review = require('../models/reviewModel');
const Product = require('../models/productModel');

exports.signup = (req, res) => {
    let user = req.session.user;
    res.render('signup', { user: user });
}

exports.login = (req, res) => {
    let user = req.session.user;
    res.render('login', { user: user });
}

exports.signupSeller = (req, res) => {
    let user = req.session.user;
    res.render('signupSeller', { user: user });
}

exports.addUser = async (req, res) => {
    try {
        let { username, email, password, mobileNumber } = req.body;

        let haspPass = await bcrypt.hash(password, 10);
        let userToken = await token.sign({ username, email }, 'tusharKothiya', { expiresIn: '1hr' });

        let data = await new UserModel({
            username, email, password: haspPass, mobileNumber, token: userToken
        });
        data.token = userToken;
        await data.save();
        res.redirect('/login');
    } catch (error) {
        console.log(error);
    }
}

exports.addSeller = async (req, res) => {
    try {
        let { username, email, password, mobileNumber } = req.body;

        let haspPass = await bcrypt.hash(password, 10);
        let userToken = await token.sign({ username, email }, 'tusharKothiya', { expiresIn: '1hr' });

        let data = await new UserModel({
            username, email, password: haspPass, mobileNumber, role: 'Seller', token: userToken
        });
        data.token = userToken;
        await data.save();
        res.redirect('/login');
    } catch (error) {
        console.log(error);
    }
}

exports.loginPost = async (req, res) => {
    try {
        let { email, password } = req.body;

        let isAdmin = await Admin.findOne({email});
        if(isAdmin){
            if(password === isAdmin.password){
                req.session.admin = isAdmin;
                res.redirect('/admin');
            }
        }

        let user = await UserModel.findOne({ email });

        if (!user) {
            res.status(404).json({ message: "user not exist" })
        }

        let isPass = await bcrypt.compare(password, user.password);
        if (!isPass) {
            // res.status(404).json({ message: "incorrect password" });
            notifier.notify('incorrect password');
            res.redirect('/login');
        }else{
            req.session.user = user;
            res.redirect('/');
        }
        
        
        
    } catch (error) {
        console.log(error);
    }
}

//forget password
exports.forgotPassword1 = (req, res) => {
    let user = req.session.user;
    res.render('forgot-password', { user: user });
}



exports.forgotPassword1Post = async (req, res) => {
    try {
        
        let email = req.body.email;
        let otp = generateRandomNumber();
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
            subject: 'Password Recover', // Subject line
            text: 'Your OTP:- ' + otp + ' to reset your password'// Plain text body
        };

        // Send email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                res.send('Error occurred, email not sent.'); // Handle error
            } else {
                res.render('forgot-password2', {email: email , data : otp});
                console.log('Email sent: ' + info.response);
            }
        });

    } catch (error) {
        console.log(error);
    }
}

exports.verifyOTP = async (req,res) => {
    try {
        const {otp , password , origionalOTP, email} = req.body;
        if(origionalOTP === otp){
            const haspPass = await bcrypt.hash(password,10)
            await UserModel.findOneAndUpdate({email}, { $set: {password : haspPass} });
            res.redirect('/login');
        }else{
            res.status(404).json({message: 'provide correct otp'})
        }
    } catch (error) {
        console.log(error);
    }
}

exports.logout = async (req,res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/login'); // Redirect to login page after logout
            }
        });
    } catch (error) {
        console.log(error);
    }
}

//delete user
exports.removeUser = async (req,res) => {
    try {
        let userID = req.params.id;

        let user = await UserModel.findById(userID);
        let userEmail = user.email;

        await UserModel.findByIdAndDelete(userID);

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
            subject: 'Password Recover', // Subject line
            text: 'Your BigBazaar Optical Shop Account has been removed by Admin'// Plain text body
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

        res.redirect('/report');
    } catch (error) {
        console.log(error);
    }
}

//contact user
exports.contactUser = async (req,res) => {
    try {
        const {fullName, email, subject, message} = req.body;
        let data = await new Contact({
            fullName, email, subject, message
        })
        await data.save();

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
            subject: 'Contact Inquiry in BigBazaar Optical Shop', // Subject line
            text: 'Your Response has succesfully saved'// Plain text body
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
        res.redirect('/contact')
    } catch (error) {
        console.log(error);
    }
}

//add review
exports.addReview = async (req, res) => {
    try {
        const { name, email, message, productID } = req.body;

        // Check if a review with the same email already exists
        const existingReview = await Review.findOne({ email: email });

        if (existingReview) {
            return res.status(400).json({ error: "A review with the same email already exists" });
        }

        const newReview = new Review({
            name: name,
            email: email,
            message: message,
            productID: productID
        });

        const savedReview = await newReview.save();
        const product = await Product.findById(productID);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Push the newly created review's id into the product's reviews array
        product.reviews.push(savedReview._id);

        // Save the updated product
        await product.save();

        res.redirect(`/view/${productID}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error adding review" });
    }
}
