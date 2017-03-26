
var mongoose = require('mongoose')
const conf = require('../../config')

var userSchema = {
    schema : mongoose.Schema({
		author: { type : String , ref : conf.database.collections.users },
		to: { type : String , ref : conf.database.collections.users },
		date:Date,
		subject:String,
		content:String,
		seen:Boolean
    }),
    collection:conf.database.collections.inbox
}

module.exports.Schema = userSchema;

