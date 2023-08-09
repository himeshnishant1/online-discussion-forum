const mongoose = require('mongoose');

const replyModel = new mongoose.Schema({
    commentid: {type: String, required: true},
    body: {type: String, required: true},
    username: {type: String, required: true},
    createdOn: {type: Date, default: Date.now(), required: true}
});

module.exports = mongoose.model('reply', replyModel);