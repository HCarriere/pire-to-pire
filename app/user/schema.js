
const collection = 'user';
var mongo = require('../mongo')
var mongoose = require('mongoose')


var userSchema = mongoose.Schema({
    login: String,
    password : String,
    name : String,
    privileges : [String],
    rank : {
        type : String,
        match : /^[a-zA-Z0-9-_]+$/
    },
    articles : [String]
});


module.exports.Model = mongoose.model(collection,userSchema);
