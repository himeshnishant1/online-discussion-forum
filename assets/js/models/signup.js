const mongoose = require('mongoose');

const signupModel = new mongoose.Schema({
    firstname: String,
    lastname: String, 
    email: String,
    country: String,
    password: String,
});

module.exports = mongoose.model('Users', signupModel); 