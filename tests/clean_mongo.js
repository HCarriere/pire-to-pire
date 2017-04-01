const mongo = require('../app/mongo')
const ArticleSchema = require('../app/article').Schema
const UserSchema = require('../app/user').Schema
const ChatSchema = require('../app/chat').Schema
const InboxSchema = require('../app/inbox').Schema
const SharedSchema = require('../app/shared').Schema

var schemaList = [
	ArticleSchema,
	UserSchema,
	ChatSchema,
	InboxSchema,
	SharedSchema
]

function cleanEverything(schemas, onDone) {
	if(schemas.length <= 0){
		onDone();
		return;
	}
	var schema = schemas.pop();
	console.log("cleaning "+schema.collection+"...");
	mongo.remove(schema, {}, function(err){
		cleanEverything(schemas, onDone);
	})
}

function init(onDone){
 	
	cleanEverything(schemaList, onDone);
    
}

module.exports = {
	init
}