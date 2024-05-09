const mongoose = require('mongoose');
require('../db/connection');

let adminSchema = new mongoose.Schema({
    email: String,
    password: String
});

module.exports = mongoose.model('Admin', adminSchema);

