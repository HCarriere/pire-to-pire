const ArticleSchema = require('./schema').Schema
const mongo = require('../mongo')




function getArticles(callback){

    mongo.find(ArticleSchema, {}, function(err,result){
        if(err){
            callback(err, null)
        }
        else{
            callback(null,result)
        }
    })
    
}

function addArticle(request,callback){
    
    if(!request.isAuthenticated()){
        callback({err:'Non authentifié'},null);
        return;
    }
    if(!request.body.name || !request.body.content || !request.body.tags){
        callback({err:'Contenu vide'},null);
        return;
    }
    
    var object ={
        name:request.body.name.trim(),
        shortName: setShortName(request.body.name.trim()),
        content: request.body.content,
        extract: getExtract(request.body.content),
        //datum
        tags: getTags(request.body.tags),
        author: request.user.login
    };

    mongo.add(object, ArticleSchema, function(err){
        if(err){
            callback(err,null)    
        }else{
            callback(null,object.shortName)
        }
    })
}

module.exports = {
    getArticles,
    addArticle
}


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
    var tags = tagsRequest.replace(/ /g,';').split(';');
    for (var tag in tags){
        if(tags[tag]){
            r.push({tag:tags[tag]});
        }
    }
    return r;
}

function getExtract(content){
    return content.substring(0,150);
}
