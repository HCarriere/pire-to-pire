const UserSchema = require('./schema').Schema
const mongo = require('../mongo')
const utils = require('../utils')


////////// private ////////////////
/*
function getIsPseudoExisting(pseudo, login,  exist){
    mongo.findOne( UserSchema, function(err, result){
        if(result){
            if(result.login != login){
                //qq d'autre a ce pseudo
                exist(true)
            }else{
                //j'ai ce pseudo
                exist(false)
            }
        }else{
            exist(false)
        }
    },{ pseudo:pseudo })
}*/


/////////////  public //////////

/**
récupère les info de l'utilisateur connecté dans la requete
*/
function getUserInfo(request, callback){
    if(!request.isAuthenticated() ){
       callback(null)
       return;
    }
    
    var login = request.user.login;
    
    mongo.findOne(UserSchema, function(err, result){
        if(!err){
            callback(result);
        }else{
            callback(null);
        }
    },{login: login});
}


/**
middleware
récupère les info de l'utilisateur avec son login
celui-ci est en param en url (/url/:id)
ou en param simple
*/
function getUserInfoByLogin(){
    return function (request, response, next) {
        if(request.params.id) {
            login = request.params.id;
        }else{
            login = request.user.login;
        }
        mongo.findOne(UserSchema, function(err, result){
            if(result){
                request.profile = result;
            }
            return next();
        },{login: login});
    }
}

//middleware
function getUserPrivileges(){
    return function (request, res, next) {
    if(!request.isAuthenticated() ){
       return next();
    }
    
    var login = request.user.login;
        mongo.findOne(UserSchema, function(err, result){
            if(result){
                request.privileges = result.privileges;
				request.userLogin = result.login;
            }
            return next();
        },{login: login});
    }
}


//POST params : request.body.*
function updateUserInfo(request, callback){
    if(!request.isAuthenticated()){
       callback({error:'Non authentifié.'})
    }
    /*if(!request.body.pseudo){
       callback({error:'Informations introuvables'})
    }*/
    var login =  request.user.login;
    //var pseudo = request.body.pseudo.trim();

    mongo.update(
        UserSchema,
        function(err,result){
            callback(err)
        },{
            //conditions
            login:login 
        },
        {
            //update
            fullName:request.body.fullName.trim(),
            //pseudo: pseudo,
            geo:{
                country: request.body.geo_country,
                city:request.body.geo_city
            }
        },
        { /*options*/ }
    );

}



function updateUserPassword(request, callback){
    if(!request.isAuthenticated()){
       callback({error:'Non authentifié.'});
       return;
    }
    if(!request.body.old_password || !request.body.new_password1 || !request.body.new_password2){
        callback({error:'Informations introuvables'});
        return;
    }
    if(request.body.new_password1 != request.body.new_password2){
        callback({notSamePassword:true});
        return;
    }
    mongo.findOne(UserSchema,function(err,result){
        if(result.password === utils.encryptPassword(request.body.old_password)){
            mongo.update(
                UserSchema,
                function(err,result){
                    callback(err)
                },
                {
                    login:request.user.login
                },
                {
                    password:utils.encryptPassword(request.body.new_password1)
                },
                { }
            );
        }else{
            callback({wrongPassword:true});
        }
    }, {login:request.user.login})
}


function updateUserProfilePicture(request, callback){
    if(!request.isAuthenticated()){
       callback({error:'Non authentifié.'})
       return;
    }
    if(!request.file.filename){
        callback({error:'Informations introuvables'})
    }
    var login =  request.user.login;
    mongo.update(
        UserSchema,
        function(err,result){
            callback(err)
        },
        {
            login:login 
        },
        {
            picture:request.file.filename
        },
        { }
    );
}

function listUsers(limit, callback, offset){
    mongo.count(UserSchema, function(err, count){
        mongo.findWithOptions(UserSchema, function(err, result){
            if(err) {
                console.log(err);
            }
            callback(err, result, count);
        }, {},limit,{inscriptionDate:-1},offset);
    }, {});
}


/////////// exports //////////////

module.exports = {
    getUserInfo,
    updateUserInfo,
    updateUserProfilePicture,
    updateUserPassword,
    getUserInfoByLogin,
    getUserPrivileges,
    listUsers
}