const UserSchema = require('./schema').Schema
const mongo = require('../mongo')


/////////////  public //////////
function getUserInfo(request, callback){
    if(!request.isAuthenticated()){
       callback(null)
    }
    var login =  request.user.login;
    
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

//POST params : request.body.*
function updateUserInfo(request, callback){
    if(!request.isAuthenticated()){
       callback('Non authentifié.')
    }
    if(!request.body.pseudo){
       callback('Impossible de récuperer le pseudo.')
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
            callback('Pseudo déjà utilisé.')
        }
    })
}


function updateUserProfilePicture(request, callback){
    if(!request.isAuthenticated()){
       callback('Non authentifié.')
       return;
    }
    if(!request.file.filename){
        callback('pas de fichier')
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



/////////// exports //////////////

module.exports = {
    getUserInfo : getUserInfo,
    updateUserInfo : updateUserInfo,
    updateUserProfilePicture : updateUserProfilePicture
}