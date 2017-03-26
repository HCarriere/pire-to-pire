var schema = require('./schema')
var inbox = require('./inbox')

module.exports = {
    Schema : schema.Schema,
    getMessage : inbox.getMessage,
	listReceivedMessages : inbox.listReceivedMessages,
	listSendedMessages : inbox.listSendedMessages,
	listAllMessages : inbox.listAllMessages,
	sendMessage : inbox.sendMessage,
	isRelatedToMessage : inbox.isRelatedToMessage
}