/*

message recu  :  {message,author,keyAuth}
message renvoyé  :  {message, author, date}
*/

const io = require('socket.io')();
const mongo = require('../mongo')
const ChatMessageSchema = require('./schema').Schema
const utils = require('../utils')
const md5 = require('md5');
const conf = require('../../config')

////////////// PUBLIC //////////////
////////////////////////////////////

function init(){
	io.sockets.on('connection', function(socket){
		onConnect(socket);
		//SESSION ON
		
		socket.on('message',function(data){
			//verify
			processData(data, function(response){
				io.emit('message', response);
			});
		});

		//SESSION OFF
		socket.on('disconnect', function(){
			onDisconnect(socket);
		});
	});
	io.listen(8080);
	console.log("socket.io listening *:8080");
	
}

/**
* middleware of home
* fetch the last X messages
*/
function fetchPreviousChatMessages(limit){
	
	return function (request, response, next) {
        mongo.findWithOptions(ChatMessageSchema, function(err,result){
			if(result){
				for(var chatMessage of result){
					chatMessage.stringDate = utils.getSimpleStringDate(chatMessage.date);
				}
				request.previousChatMessage = result;
			}
			return next();
		},{},limit,{date:1});
    }
}

////////////// PRIVATE //////////////
/////////////////////////////////////


function onConnect(socket){
	console.log('user connected to chat');
}

function onDisconnect(socket){
	console.log('user disconnected to chat');
}

//verify if data are ok, then send it to db (saveMessage)
//onSuccess: {message, author, date }
function processData(data, onSuccess){
	if(data.message && data.message.trim().length > 0 && isAuthorValid(data.author, data.keyAuth)){
		var object = {
			message	: escapeHtml(data.message.trim()),
			author	: data.author,
			date	: new Date()
		};
		saveMessage(object, function(){
			object.date = utils.getSimpleStringDate(object.date);
			onSuccess(object);
		});
	}
}

/**
* save the message to db for future usages
*/
function saveMessage(object, callback){
	mongo.add(ChatMessageSchema, function(){
		callback();
	},object);
}

function isAuthorValid(author, key){
	console.log(author+" -> "+key)
	if(author && key){
		if(getKeyFromPseudo(author) === key){
			return true;
		}else{
			console.log("warning(chat): author/key unautorized:"+author+" -> "+key);
			return false;
		}
	}
	console.log("error(chat): author/key of invalid format :"+author+" -> "+key);
	return false;
}


//escaping html
var entityMap = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': '&quot;',
  "'": '&#39;',
  "/": '&#x2F;'
};

function escapeHtml(string) {
  return String(string).replace(/[&<>"'\/]/g, function (s) {
    return entityMap[s];
  });
}

function getKeyFromPseudo(pseudo){
	if(pseudo != null) 
		return md5(pseudo+conf.chat.secret);
	return "";
}

//////////////////////////////////////

module.exports = {
    init,
	fetchPreviousChatMessages
}
