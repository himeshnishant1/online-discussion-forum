const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    username: {type: String, required: true},
    title: {type: String, required: true}, 
    body: {type: String, required: true},
    createdOn: { type: Date, default: Date.now(), required: true},
    comments: {type: Number, required: true},
    views: {type: Number, required: true},
    likes: {type: Number, required: true}
});

module.exports = mongoose.model("post", postSchema);