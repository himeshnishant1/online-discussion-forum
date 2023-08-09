const mongoose = require('mongoose');

const commentModel = new mongoose.Schema({
    postid: {type: String, required: true},
    body: {type: String, required: true},
    username: {type: String, required: true},
    createdOn: {type: Date, default: Date.now(), required: true}
});

module.exports = mongoose.model('comments', commentModel);