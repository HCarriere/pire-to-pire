/*****
SEARCH MODULE

4 recherches effectuées : 
-news
-articles
-partages

query type possible:


- tag
    _news -> les news contenant les tags
    _articles -> les articles " 
    _partages -> les partages "
- text
    _news -> les news contenant une partie du texte (content / titre)
    _articles -> les articles "
    _partages -> les partages "




*****/

const mongo = require('../mongo')
const conf = require('../../config')
const utils = require('../utils')
//shemas
const ArticleSchema = require('../article').Schema



///////////// private /////////////////




//////////////public ////////////////
//middleware 1
function findNews(){
     return function (request, response, next) {
        var jsonRequest;
        if(request.query.tag){
            jsonRequest = {'tags.tag' : request.query.tag, isNews: true};
        }
        if(request.query.text){
            jsonRequest = {$or:[{name: new RegExp(request.query.text, "i")}, {content: new RegExp(request.query.text, "i")}],isNews: true};
        }
        mongo.findWithOptions(ArticleSchema, function(err, result){
            if(result){
                //articles trouvés
                for (var article of result){
                    article.stringPublicationDate = utils.getStringDate(article.publicationDate);
                    article.extract = utils.getExtractOf(article.content);
                }
                request.newsFound = result
            }
            return next()
        }, jsonRequest, 0, {})
    }
}

//middleware 2
function findArticles() {
    return function (request, response, next) {
        var jsonRequest;
        if(request.query.tag){
            jsonRequest = {'tags.tag' : request.query.tag, isNews: false};
        }
        if(request.query.text){
            jsonRequest = {$or:[{name: new RegExp(request.query.text, "i")}, {content: new RegExp(request.query.text, "i")}],isNews: false};
        }
        mongo.findWithOptions(ArticleSchema, function(err, result){
            if(result){
                //articles trouvés
                for (var article of result){
                    article.stringPublicationDate = utils.getStringDate(article.publicationDate);
                    article.extract = utils.getExtractOf(article.content);
                }
                request.articlesFound = result
            }
            return next()
        }, jsonRequest, 0, {})
    }
}

//middleware 3
function findShareables(){
    return function (request, response, next) {
        //request.shareableFound = { coucou : "result2"}
        return next();   
    }
}



module.exports = {
    findNews,
    findArticles,
    findShareables
}


