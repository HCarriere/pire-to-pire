var schema = require('./schema')
var article = require('./article')

module.exports = {
    Model : schema.Model,
    getArticles: article.getArticles
}