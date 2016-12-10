const UserSchema = require('./schema').Schema
const mongo = require('../mongo')
const md5 = require('md5')


////////// private ////////////////

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
}

function hashPassword(password){
    return md5(password);
}



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
récupère les info de l'utilisateur avec son pseudo
*/
function getUserInfoByPseudo(){
    return function (request, response, next) {
        var pseudo =request.params.id;
            mongo.findOne(UserSchema, function(err, result){
            if(result){
                request.profile = result;
            }
            return next();
        },{pseudo: pseudo});
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
				request.userPseudo = result.pseudo;
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
    if(!request.body.pseudo){
       callback({error:'Informations introuvables'})
    }
    var login =  request.user.login;
    var pseudo = request.body.pseudo.trim();
    
    getIsPseudoExisting(pseudo, login, function(exists){
        if(!exists){
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
        }else{
            callback({pseudoAlreadyInUse:pseudo})
        }
    })
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
        if(result.password === hashPassword(request.body.old_password)){
            mongo.update(
                UserSchema,
                function(err,result){
                    callback(err)
                },
                {
                    login:request.user.login
                },
                {
                    password:hashPassword(request.body.new_password1)
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

function listUsers(callback){
    mongo.findWithOptions(
        UserSchema, 
        function(err, result){
            if(result){
                callback(result)
            }else{
                callback(null)
            }
        }, {},0,{inscriptionDate:-1}
    );
}


/////////// exports //////////////

module.exports = {
    getUserInfo,
    updateUserInfo,
    updateUserProfilePicture,
    updateUserPassword,
    getUserInfoByPseudo,
    getUserPrivileges,
    listUsers
}