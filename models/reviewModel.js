require('../db/connection');
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        
    },
    message: {
        type: String,
        required: true
    },
    createDate: {
        type: Date,
        default: Date.now
    },
    productID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }
});

module.exports = mongoose.model('Review', reviewSchema);