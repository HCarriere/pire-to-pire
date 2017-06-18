var schema = require('./schema')
var shared = require('./shared')

module.exports = {
    Schema : schema.Schema,
    addShareable : shared.addShareable,
    listShareables : shared.listShareables,
    getShareable : shared.getShareable,
    getAuthorPublications : shared.getAuthorPublications,
	editShareable : shared.editShareable,
    commentShareable : shared.commentShareable,
	vote: shared.vote,
}