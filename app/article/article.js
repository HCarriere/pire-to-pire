const ArticleSchema = require('./schema').Schema
const mongo = require('../mongo')


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
        if(tags[tag] && !u.hasOwnProperty(tags[tag]) ){
            r.push({tag:tags[tag]});
            u[tags[tag]] = 1;
        }
    }
    return r;
}

function getExtract(content){
    return content.substring(0,400);
}

function getStringDate(date){
    return date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes();
}

function getHTMLContent(content){
    content = content.replace(/\n/g,'<br>');
    content = content.replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    content = content.replace(/\r/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    return content;
}



//////////// public ////////////////

function listArticles(limit, callback){
    mongo.findWithOptions(ArticleSchema, {},limit,{publicationDate:-1}, function(err,result){
        if(err){
            callback(err, null)
        }
        else{
            for (var article of result){
                article.stringPublicationDate = getStringDate(article.publicationDate);
            }
            callback(null,result)
        }
    })
}

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
        extract: getExtract(request.body.content),
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


function getArticle(shortName, callback){
    mongo.findOne(ArticleSchema, {shortName: shortName}, function(err,result){
        if(result){
            result.stringPublicationDate = getStringDate(result.publicationDate);
            result.content = getHTMLContent(result.content);
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


