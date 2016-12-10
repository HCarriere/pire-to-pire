//name of the collection in MongoDB (will take a '*s' on mongoDB)
//const collection = 'article';
//get mongoose
var mongoose = require('mongoose')
const conf = require('../../config')

var chatMessageSchema = {
    schema:mongoose.Schema({
        message: String,
        date: Date,
        author: { type : String , ref : conf.database.collections.users }
    }),
    collection : conf.database.collections.chatMessage
}

module.exports.Schema = chatMessageSchema
