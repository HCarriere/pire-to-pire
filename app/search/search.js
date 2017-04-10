/*****
SEARCH MODULE

3 recherches effectuées : 
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
const ShareableSchema = require('../shared').Schema


///////////// private /////////////////

function getJsonRequest(request, additionalArguments) {
	var jsonRequest = {};
	if(request.query.tag){
		jsonRequest = {
			'tags.tag' : request.query.tag
		};
	}
	if(request.query.text){
		jsonRequest = {
			$or:[{name: new RegExp(request.query.text, "i")}, {content: new RegExp(request.query.text, "i")}]
		};
	}
	
	if(additionalArguments) {
		for(var key in additionalArguments) {
			jsonRequest[key] = additionalArguments[key];
		}
	}
	return jsonRequest;
}


//////////////public ////////////////
//middleware 1
function findNews(){
     return function (request, response, next) {
        var jsonRequest = getJsonRequest(request, {isNews:true});
		
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
        }, jsonRequest, conf.limitDocuments.search, {})
    }
}

//middleware 2
function findArticles() {
    return function (request, response, next) {
        var jsonRequest = getJsonRequest(request, {isNews:false});
		
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
        }, jsonRequest, conf.limitDocuments.search, {})
    }
}

//middleware 3
function findShareables(){
    return function (request, response, next) {
        var jsonRequest = getJsonRequest(request);
		
        mongo.findWithOptions(ShareableSchema, function(err, result){
            if(result){
                //articles trouvés
                for (var share of result){
                    share.stringPublicationDate = utils.getStringDate(share.publicationDate);
					share.extract = utils.getExtractOf(share.description);
                }
                request.shareableFound = result
            }
            return next()
        }, jsonRequest, conf.limitDocuments.search, {})
    }
}



module.exports = {
    findNews,
    findArticles,
    findShareables
}


