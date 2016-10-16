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
    extract: String,
    publicationDate: Date,
    modificationDate: Date,
    tags: {
        tag:[String]
    },
    author: String
});


module.exports.Model = mongoose.model(collection,schema);
