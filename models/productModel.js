const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_price: {
        type: Number,
        required: true
    },
    product_star: {
        type: Number
    },
    discount: {
        type: Number
    },
    bank_offer: {
        type: String
    },
    seller_brand_logo: {
        type: String
    },
    product_image1: {
        type: String
    },
    product_image2: {
        type: String
    },
    product_image3: {
        type: String
    },
    product_rating: {
        type: String
    },
    product_quantity: {
        type: Number
    },
    product_sold: {
        type: Number
    },
    product_original_price: {
        type: Number
    },
    return_policy_day: {
        type: Number
    },
    cash_on_delivery: {
        type: String
    },
    free_delivery: {
        type: String
    },
    brand_name: {
        type: String
    },
    frame_colour: {
        type: String
    },
    frame_size: {
        type: String
    },
    frame_width: {
        type: String
    },
    frame_dimensions: {
        type: String
    },
    frame_shape: {
        type: String
    },
    category: {
        type: String
    },
    tags: {
        type: String
    },
    model_no: {
        type: String
    },
    item_weight: {
        type: String
    },
    weight_group: {
        type: String
    },
    material: {
        type: String
    },
    prescription_type: {
        type: String
    },
    upload_date: {
        type: Date,
        default: Date.now
    },
    createBy: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
    }]
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
