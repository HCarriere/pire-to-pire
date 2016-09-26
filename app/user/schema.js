var mongoose = require('mongoose')

var userSchema = mongoose.Schema({
    login : {
        type : String,
        match : /^[a-zA-Z0-9-_]+$/
    },
    password : String,
    name : String,
    privileges : [String],
    rank : String
});


function getModel(){
    return mongoose.model('user',userSchema);
}

module.exports.getModel = getModel