
//const collection = 'user';
var mongoose = require('mongoose')
const conf = require('../../config')

var userSchema = {
    schema : mongoose.Schema({
        login: String,
        password : String,
        pseudo: String,
        fullName : String,
        mail: {
            type: String,
            match: /^[^\n]+@[^\n]+.[a-zA-Z]+$/
        },
        picture: String,
        privileges : [
           { privilege:String }
        ],
        rank : String,
        
        inscriptionDate : Date,
        /*actualities:[
              { type : String , ref : "conf.database.collections.actualities"}
        ],
        articles : [ 
             { type : String , ref : conf.database.collections.articles }
        ],*/
        options: {
             notifications: Boolean
        },
        geo: {
            country:String,
            city:String
        },
        verified: Boolean
    }),
    collection:conf.database.collections.users
}


//module.exports.Model = mongoose.model(collection,userSchema);
module.exports.Schema = userSchema;

