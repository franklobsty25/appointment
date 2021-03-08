const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var passportLocalMongoose = require('passport-local-mongoose');

const commentSchema = new Schema({comment: String});

const userModel = new Schema({
    name: String,
    phoneNumber: String,
    location: String,
    admin: Boolean
}, {
    timestamps: true
});

userModel.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userModel);