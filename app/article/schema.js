//name of the collection in MongoDB (will take a '*s' on mongoDB)
const collection = 'article';
//get mongo utils
var mongo = require('../mongo')
//get mongoose
var mongoose = require('mongoose')


var schema = mongoose.Schema({
    name: String,
    shortName: String,
    content: String,
    publicationDate: Date,
    modificationDate: Date,
    tags: [String],
    Author: [mongoose.Schema.Types.ObjectId]
});


module.exports.Model = mongoose.model(collection,schema);
