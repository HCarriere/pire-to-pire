
const collection = 'user';
var mongo = require('../mongo')
var mongoose = require('mongoose')


var userSchema = mongoose.Schema({
    login: String,
    password : String,
    name : String,
    mail: {
        type: String,
        match: /^[^\n]+@[^\n]+.[a-zA-Z]+$/
    },
    picture: String,
    privileges : [String],
    rank : {
        type : String,
        match : /^[a-zA-Z0-9-_]+$/
    },
    articles : [mongoose.Schema.Types.ObjectId],
    inscriptionDate : Date,
    actualities:  [mongoose.Schema.Types.ObjectId],
    options: {
        notifications: Boolean
    }
});


module.exports.Model = mongoose.model(collection,userSchema);
