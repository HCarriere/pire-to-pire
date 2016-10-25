var schema = require('./schema')
var article = require('./article')

module.exports = {
    Schema : schema.Schema,
    listArticles: article.listArticles,
    addArticle: article.addArticle,
    getArticle: article.getArticle,
    getAuthorPublications : article.getAuthorPublications
}