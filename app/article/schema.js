//name of the collection in MongoDB (will take a '*s' on mongoDB)
//const collection = 'article';
//get mongoose
var mongoose = require('mongoose')


var articleSchema = {
    schema:mongoose.Schema({
        name: String,
        shortName: String,
        content: String,
        extract: String,
        publicationDate: Date,
        modificationDate: Date,
        tags: [
            {tag:String}
        ],
        author: String
    }),
    collection:'article'
}


//module.exports.Model = mongoose.model(collection,articleSchema);
module.exports.Schema = articleSchema
