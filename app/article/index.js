var schema = require('./schema')
var article = require('./article')

module.exports = {
    Schema : schema.Schema,
    getArticles: article.getArticles,
    addArticle: article.addArticle
}