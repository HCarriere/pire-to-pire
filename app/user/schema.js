
//const collection = 'user';
var mongoose = require('mongoose')
const conf = require('../../config')

var userSchema = {
    schema : mongoose.Schema({
        login: String,
        password : String,
        name : String,
        mail: {
            type: String,
            match: /^[^\n]+@[^\n]+.[a-zA-Z]+$/
        },
        picture: String,
        privileges : [
           { privilege:String }
        ],
        rank : {
            type : String,
            match : /^[a-zA-Z0-9-_]+$/
        },
        articles : [ 
             { type : String , ref : conf.database.collections.articles }
        ],
        inscriptionDate : Date,
        actualities:[
              { type : String , ref : "conf.database.collections.actualities"}
        ],
        options: {
             notifications: Boolean
        }
    }),
    collection:conf.database.collections.users
}


//module.exports.Model = mongoose.model(collection,userSchema);
module.exports.Schema = userSchema;

