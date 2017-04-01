const InboxSchema = require('./schema').Schema
const mongo = require('../mongo')
const utils = require('../utils')

function listMessages(request, callback, options) {
	
	mongo.findWithOptions(InboxSchema, function(err,result){
        if(err){
            callback(err, null)
        }
        else{
			for (var message of result) {
				message.simpleDate = utils.getSimpleStringDate(message.date);
				message.extract = utils.getExtractOf(message.content,60);
			}
            callback(null,result)
        }
    },options,0,{date:-1})
}

function listReceivedMessages(request, callback) { 
	if(!request.isAuthenticated() ){
       callback(null)
       return;
    }
	
	var login = request.user.login;
	listMessages(request, function(err,result) {
		callback(err,result);
	}, {to: login})
}

function listSendedMessages(request, callback) {
	if(!request.isAuthenticated() ){
	   callback(null)
	   return;
	}
	
	var login = request.user.login;
	listMessages(request, function(err,result) {
		callback(err,result);
	}, {author: login})
}


function listAllMessages(request, callback){
	listReceivedMessages(request, function(errR,received) {
		listSendedMessages(request, function(errS,sended) {
			var messages = {received:received, sended:sended};
			callback(messages);
		})
	})
}

function getMessage(request, callback){
	if(!request.isAuthenticated() ){
       callback(null)
       return;
    }
	var login = request.user.login;
	var id = request.params.id;
	mongo.findById(InboxSchema, function(err,result){
		if(result) {
			if(!result.seen && result.to == login){
				setMessageSeen(id);
			}
			result.simpleDate = utils.getStringDate(result.date);
			result.content = utils.getHTMLContent(result.content);
			callback(result)
			return;
		}else{
			callback('Message introuvable');
			return;
		}
		
	},id);
}

function sendMessage(request, callback) {
	if(!request.isAuthenticated() ){
       callback(null)
       return;
    }
	if(!request.body.to || !request.body.subject || !request.body.content){
        callback({error:'Contenu vide'},null);
        return;
    }
	var login = request.user.login;
	
	var object = {
		author:login,
		to:request.body.to,
		date:Date.now(),
		subject:request.body.subject,
		content:request.body.content,
		seen:false
	}
	mongo.add(InboxSchema, function(err, result) {
		if(err) {
			callback(err,null)
		} else {
			callback(null,result)
		}
	},object)
}

/*
middleware
continue seulement si l'utilisateur connecté a le droit de regarder ce mail
*/
function isRelatedToMessage(){
	return function (request, response, next) {
		if(!request.isAuthenticated() ){
		   response.redirect('/forbidden');
		}
		var login = request.user.login;
		getMessage(request, function(result){
			if(result) {
				if(result.author == login || result.to == login){
					return next();
				}else{
					response.redirect('/profile/inbox');
				}
			}
		})
    }
}

/*
middleware
donne le nombre de messages non lus
*/
function getUnseenMessagesCount(){
	return function (request, response, next) {
		if(!request.isAuthenticated() ){
			return next();
		}
		var login = request.user.login;
		
		mongo.count(InboxSchema, function(err,result) {
			request.unseenMessages = result;
			return next();
		}, {to:login, seen:false})
    }
}

function setMessageSeen(id){
	mongo.update(InboxSchema,function(err,result){
		//nuthin'
	}, {_id:id}, {seen:true}, {});
}

module.exports = {
	getMessage,
	listReceivedMessages,
	listSendedMessages,
	listAllMessages,
	sendMessage,
	isRelatedToMessage,
	getUnseenMessagesCount
}