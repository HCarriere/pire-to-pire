/*****
SEARCH MODULE

4 recherches effectuées : 
-news
-articles
-partages
-user

query type possible:

- user : 
    _news -> les news des utilisateurs recherchés
    _articles -> les articles " 
    _partages -> les partages "
    _user -> les utilisateurs ayant un pseudo similaire
- tag
    _news -> les news contenant les tags
    _articles -> les articles " 
    _partages -> les partages "
    _user -> pas d'utilisateur retournés
- text
    _news -> les news contenant une partie du texte
    _articles -> les articles "
    _partages -> les partages "
    _user -> les utilisateurs ayant un pseudo similaire




*****/

const mongo = require('../mongo')
const conf = require('../../config')
//shemas
const UserSchema = require('../user').Schema
const ArticleSchema = require('../article').Schema



///////////// private /////////////////




//////////////public ////////////////
//middleware 1
function findNews(){
    return function (request, response, next) {
        //request.newsFound = { coucou : "result"}
        return next();   
    }
}

//middleware 2
function findArticles() {
    return function (request, response, next) {
        var jsonRequest;
        if(request.query.tag){
            jsonRequest = {tags : {tag : request.query.tag} };
        }
        if(request.query.user){
            jsonRequest = {author:request.query.user};
        }
        if(request.query.text){
            jsonRequest = {};
        }
        mongo.findWithOptions(ArticleSchema, jsonRequest, 0, {}, function(err, result){
            if(result){
                //articles trouvés
                request.articlesFound = result
            }
            return next()
        })
    }
}

//middleware 3
function findShareables(){
    return function (request, response, next) {
        //request.shareableFound = { coucou : "result2"}
        return next();   
    }
}

//middleware 4
function findUsers(){
    return function (request, response, next) {
        var jsonRequest;
        if(request.query.tag){
            jsonRequest = {};
        }
        if(request.query.user){
            jsonRequest = {pseudo:request.query.user};
        }
        if(request.query.text){
            jsonRequest = {};
        }
        mongo.find(UserSchema, jsonRequest, function(err, result){
            if(result){
                request.userFound = result
            }
            return next(); 
        })
        
    }
}


module.exports = {
    findNews,
    findArticles,
    findShareables,
    findUsers
}


