const UserSchema = require('./schema').Schema
const mongo = require('../mongo')
const md5 = require('md5')


////////// private ////////////////

function getIsPseudoExisting(pseudo, login,  exist){
    mongo.findOne( UserSchema, { pseudo:pseudo }, function(err, result){
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
    })
}

function hashPassword(password){
    return md5(password);
}



/////////////  public //////////
function getUserInfo(request, callback){
    if(!request.isAuthenticated() ){
       callback(null)
    }
    
    var login = request.user.login;
    
    mongo.findOne(UserSchema, {
        login: login
    }, function(err, result){
        if(!err){
            callback(result);
        }else{
            callback(null);
        }
    });
}

function getUserInfoByPseudo(pseudo, callback){
    mongo.findOne(UserSchema, {
        pseudo: pseudo
    }, function(err, result){
        if(!err){
            callback(result);
        }else{
            callback(null);
        }
    });
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
                {
                    //conditions
                    login:login 
                },
                {
                    //update
                    fullName:request.body.fullName.trim(),
                    pseudo: pseudo,
                    geo:{
                        country: request.body.geo_country,
                        city:request.body.geo_city
                    }
                },
                { /*options*/ },
                function(err){
                    callback(err)
                }
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
    mongo.findOne(UserSchema, {login:request.user.login},function(err,result){
        if(result.password === hashPassword(request.body.old_password)){
            mongo.update(
                UserSchema,
                {
                    login:request.user.login
                },
                {
                    password:hashPassword(request.body.new_password1)
                },
                { },
                function(err){
                    callback(err)
                }
            );
        }else{
            callback({wrongPassword:true});
        }
    })
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
        {
            login:login 
        },
        {
            picture:request.file.filename
        },
        { },
        function(err){
            callback(err)
        }
    );
}



/////////// exports //////////////

module.exports = {
    getUserInfo,
    updateUserInfo,
    updateUserProfilePicture,
    updateUserPassword,
    getUserInfoByPseudo
}