var schema = require('./schema')
var article = require('./article')

module.exports = {
    Schema : schema.Schema,
    listArticles: article.listArticles,
    listNews: article.listNews,
    addArticle: article.addArticle,
    addNews: article.addNews,
    getArticle: article.getArticle,
    getAuthorPublications : article.getAuthorPublications,
	editDocument : article.editDocument
}