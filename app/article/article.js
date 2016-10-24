const ArticleSchema = require('./schema').Schema
const mongo = require('../mongo')
const utils = require('../utils')

///////////// private /////////////////

function setShortName(name){
    return name.replace(/ /g,'-');
}

/**
tags: tag1;tag2;tag3
return [
    {tag:"tag1"},
    {tag:"tag2"},
    {tag:"tag3"}
]
*/
function getTags(tagsRequest){
    var r  = [];
    var u = {};
    var tags = tagsRequest.trim().replace(/,/g,';').split(';');
    
    for (var tag in tags){
        var theTag = tags[tag].trim();
        if(theTag && !u.hasOwnProperty(theTag) ){
            r.push({tag:theTag});
            u[theTag] = 1;
        }
    }
    return r;
}



function getHTMLContent(content){
    content = content.replace(/\n/g,'<br>');
    content = content.replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    content = content.replace(/\r/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    return content;
}



//////////// public ////////////////


function addArticle(request,callback){
    
    if(!request.isAuthenticated() || !request.user.pseudo){
        callback({error:'Non authentifié'},null);
        return;
    }
    if(!request.body.name || !request.body.content || !request.body.tags){
        callback({error:'Contenu vide'},null);
        return;
    }
    
    var object ={
        name:request.body.name.trim(),
        shortName: setShortName(request.body.name.trim()),
        content: request.body.content,
        publicationDate: Date.now(),
        tags: getTags(request.body.tags),
        author: request.user.pseudo
    };

    mongo.add(object, ArticleSchema, function(err){
        if(err){
            callback(err,null)    
        }else{
            callback(null,object.shortName)
        }
    })
}


function listArticles(limit, callback){
    mongo.findWithOptions(ArticleSchema, {},limit,{publicationDate:-1}, function(err,result){
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
    })
}

function getArticle(shortName, callback){
    mongo.findOne(ArticleSchema, {shortName: shortName}, function(err,result){
        if(result){
            result.stringPublicationDate = utils.getStringDate(result.publicationDate);
            result.content = getHTMLContent(result.content);
//            result.extract = getExtract(result.content);
            callback(result)
            return;
        }
        callback(null)
        return;
    })
}

module.exports = {
    listArticles,
    addArticle,
    getArticle
}


