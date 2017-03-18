const ArticleSchema = require('./schema').Schema
const mongo = require('../mongo')
const utils = require('../utils')

///////////// private /////////////////


/**
tags: tag1;tag2;tag3
return [
    {tag:"tag1"},
    {tag:"tag2"},
    {tag:"tag3"}
]
*/



function getHTMLContent(content){
    content = content.replace(/\n/g,'<br>');
    content = content.replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    content = content.replace(/\r/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    return content;
}



//////////// public ////////////////
function addDocument(request, isNews, callback){
	if(!request.isAuthenticated() || !request.user.login){
        callback({error:'Non authentifié'},null);
        return;
    }
    if(!request.body.name || !request.body.content || !request.body.tags){
        callback({error:'Contenu vide'},null);
        return;
    }
    
    var object = {
        name:request.body.name.trim(),
        shortName: utils.getShortName(request.body.name.trim()),
        content: request.body.content,
        publicationDate: Date.now(),
        tags: utils.getTags(request.body.tags),
        author: request.user.login,
        isNews: isNews
    };

    mongo.add(ArticleSchema, function(err,result){
        if(err){
            callback(err,null)    
        }else{
            callback(null,object.shortName)
        }
    },object)
}

function addArticle(request,callback){
    addDocument(request,false,callback);
}

function addNews(request,callback){
   addDocument(request,true,callback);
}



function listDocuments(limit,news,callback){
	 mongo.findWithOptions(ArticleSchema, function(err,result){
        if(err){
            callback(err, null)
        }
        else{
            for (var article of result){
                article.stringPublicationDate = utils.getStringDate(article.publicationDate);
                article.extract = utils.getExtractOf(article.content);
            }
            callback(null,result)
        }
    },{isNews: news},limit,{publicationDate:-1})
}

function listArticles(limit, callback){
    listDocuments(limit,false,callback);
}


function listNews(limit, callback){
    listDocuments(limit,true,callback);
}




function getArticle(shortName, callback) {
    mongo.findOne(ArticleSchema, function(err,result){
        if(result){
            result.stringPublicationDate = utils.getStringDate(result.publicationDate);
            result.content = getHTMLContent(result.content);
//            result.extract = getExtract(result.content);
            callback(result)
            return;
        }
        callback(null)
        return;
    },{shortName: shortName})
}


function editDocument(request, callback) {
	mongo.update(ArticleSchema, function(err, result) {
		callback(err, request.body.originalShortName)
	},
	{
		shortName: request.body.originalShortName
	},//condition
	{
		modificationDate: Date.now(),
		name: request.body.name.trim(),
		content: request.body.content,
		tags: utils.getTags(request.body.tags)
	},//update
	{})//options
}


/**
middleware
récupère de la base dataBase les articles dont 'author' est le login
*/
function getAuthorPublications(){
    return function (request, response, next) {
       mongo.find(ArticleSchema, function(err, result){
           if(result){
                for (var article of result){
                    article.stringPublicationDate = utils.getStringDate(article.publicationDate);
                    article.extract = utils.getExtractOf(article.content);
                }
                request.articles = result;
           }
           return next();
       },{author:request.params.id, isNews:false})
    }
}

module.exports = {
    listArticles,
    listNews,
    addArticle,
    addNews,
    getArticle,
    getAuthorPublications,
	editDocument
}


