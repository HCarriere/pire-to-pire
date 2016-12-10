var chat = require('./chatServer')
var schema = require('./schema')

module.exports = {
	init: chat.init,
	fetchPreviousChatMessages: chat.fetchPreviousChatMessages,
	Schema : schema.Schema
}