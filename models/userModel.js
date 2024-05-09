const mongoose = require('mongoose');
require('../db/connection');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    mobileNumber: {
        type: Number,
        required: true,
    },
    role:{
        type: String,
        default: 'User',
    },
    registrationDate: {
        type: Date,
        default: Date.now,
    },
    isPayment: {
        type: Boolean,
        default: false
    },
    token:{
        type: String,
        required: true,
    },
    cart: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product'
        },
        quantity: {
            type: Number,
            default:1
        },
        date:{
            type: Date,
            default: Date.now
        }
    }]
});


const User = mongoose.model('User', userSchema);

module.exports = User;
