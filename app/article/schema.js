//name of the collection in MongoDB (will take a '*s' on mongoDB)
//const collection = 'article';
//get mongoose
var mongoose = require('mongoose')
const conf = require('../../config')

var articleSchema = {
    schema:mongoose.Schema({
        name: String,
        shortName: String,
        content: String,
        publicationDate: Date,
        modificationDate: Date,
        tags: [
            {tag:String}
        ],
        author: { type : String , ref : conf.database.collections.users },
        isNews: Boolean,
        upvotes:[{ type : String , ref : conf.database.collections.users }],
        downvotes:[{ type : String , ref : conf.database.collections.users }],
        comments: [
            {
                content:String,
                author:{ type : String , ref : conf.database.collections.users },
                date: Date,
                upvotes:[{ type : String , ref : conf.database.collections.users }],
                downvotes:[{ type : String , ref : conf.database.collections.users }]
            }
        ]
        
    }),
    collection : conf.database.collections.articles
}


//module.exports.Model = mongoose.model(collection,articleSchema);
module.exports.Schema = articleSchema
