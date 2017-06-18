const ArticleSchema = require('./schema').Schema
const mongo = require('../mongo')
const utils = require('../utils')


function formatArticle(article) {
	article.stringPublicationDate = utils.getStringDate(article.publicationDate);
	article.extract = utils.getExtractOf(article.content);
	article.stringModificationDate = utils.getStringDate(article.modificationDate);
	article.upvoteNumber = article.upvotes.length;
	article.downvoteNumber = article.downvotes.length;
	return article;
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

    mongo.count(ArticleSchema, function(err, count){
        object.id = count+1;
        mongo.add(ArticleSchema, function(err,result){
            if(err){
                callback(err,null)    
            }else{
                callback(null,object.id);
            }
        },object);
    },{});
}

function addArticle(request,callback){
    addDocument(request,false,callback);
}

function addNews(request,callback){
   addDocument(request,true,callback);
}



function listDocuments(limit,news,callback,offset){
    mongo.count(ArticleSchema, function(err, count){
        mongo.findWithOptions(ArticleSchema, function(err,result){
            if(err){
                callback(err, null)
            }
            else{
                for (var article of result){
                    /*article.stringPublicationDate = 
						utils.getStringDate(article.publicationDate);
                    article.extract = utils.getExtractOf(article.content);*/
					formatArticle(article);
                }
                callback(null, result, count);
            }
        },{isNews: news},limit,{publicationDate:-1},offset)
    },{isNews: news});
}

function listArticles(limit, callback, offset){
    listDocuments(limit,false,callback,offset);
}


function listNews(limit, callback, offset){
    listDocuments(limit,true,callback,offset);
}




function getArticle(id, callback, editMode) {
    mongo.findOne(ArticleSchema, function(err, result){
        if(result){
            /*result.stringPublicationDate = 
				utils.getStringDate(result.publicationDate);
			result.stringModificationDate = 
				utils.getStringDate(result.modificationDate);*/
			formatArticle(result);
			
            for(var comment of result.comments) {
                comment.stringDate = utils.getStringDate(comment.date);
            }
            result.comments.sort(function(a,b) {
                return b.date - a.date;
            });
			if(editMode){
				result.content = utils.getTextContentFromHTML(result.content);
			}else{
				result.content = utils.getHTMLContent(result.content);
			}
//            result.extract = getExtract(result.content);
            callback(result)
            return;
        }
        callback(null)
        return;
    },{id: id})
}


function editDocument(request, callback) {
	mongo.update(ArticleSchema, function(err, result) {
		callback(err, request.body.originalId)
	},
	{
		id: request.body.originalId
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
                    /*article.stringPublicationDate = 
						utils.getStringDate(article.publicationDate);
                    article.extract = utils.getExtractOf(article.content);*/
					formatArticle(article);
                }
                request.articles = result;
           }
           return next();
       },{author:request.params.id, isNews:false})
    }
}

// callback(err, data)
function commentArticle(request, callback) {
    if(!request.body.comment) {
        callback('Commentaire vide.',{redirect:'/'});
        return;
    }
    var articleId = request.body.articleId;
    
    mongo.update(ArticleSchema, function(err, result) {
		callback(err, {
            redirect:'/article/'+articleId
        });
	},
	{
		id: articleId
	},//condition
	{$push: {'comments': {
            content:request.body.comment,
            author:request.user.login,
            date: new Date(),
        }
    }},//update
	{safe: true, upsert: true, new : true})//options
}

/**
POST params:
articleid: String,
downvote: Boolean
*/
function vote(request, callback) {
	if(!request.body) {
		callback({error:'Request invalid'});
		return;
	}
	mongo.findOne(ArticleSchema, (err, article) => {
		if(err || !article) {
			callback({error:err});
			return;
		}
		
		var update = {};
		var author = request.user.login;
		
		if(article.downvotes.indexOf(author) != -1 ||
		   article.upvotes.indexOf(author) != -1) {
			callback({error:'Vous avez déjà voté!'});
			return;
		}
		
		if(request.body.downvote) {
			update = {$push: {'downvotes': author}};
		} else {
			update = {$push: {'upvotes': author}};
		}
		
		mongo.update(ArticleSchema, (uErr, uRes) => {
			if(uErr) {
				callback({error:uErr});
				return;
			}
			callback({result: 'OK'});
		},
		{id: request.body.articleid},// condition
		update,
		{safe: true, upsert: true, new : true});// options
	}, {id: request.body.articleid});
}


module.exports = {
    listArticles,
    listNews,
    addArticle,
    addNews,
    getArticle,
    getAuthorPublications,
	editDocument,
    commentArticle,
	vote
}


