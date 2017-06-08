var mongoose = require('mongoose')
const conf = require('../../config')

var Schema = {
    schema:mongoose.Schema({
        name: String,
        shortName: String,
        id:String,
        description: String,
        uploadedObject: {
            name: String,
            location: String,
            size: Number,
            extension:String
        },
        publicationDate: Date,
        modificationDate: Date,
        tags: [
            {tag:String}
        ],
        author: { type : String , ref : conf.database.collections.users },
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
    collection : conf.database.collections.shareables
}


module.exports.Schema = Schema
