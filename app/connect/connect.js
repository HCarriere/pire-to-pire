//app/connect/connect.js

const passport = require('passport')  
const LocalStrategy = require('passport-local').Strategy
const UserSchema = require('../user').Schema
const mongo = require('../mongo')

////////////// private ////////////////


function findUser(username, callback){
   
    mongo.findOne(UserSchema, {
        login: username
    }, function(err, result){
        if(err){
            callback(err, null);
        }else{
            callback(null, result);
        }
    });
    
}

passport.serializeUser(function (user, cb) {
  cb(null, user.login)
})

passport.deserializeUser(function (username, cb) {
  findUser(username, cb)
})

function getExistingUser(condition, callback){
    mongo.findOne(UserSchema, condition, function(err, result){
        if(result){
            callback(true)
        }else{
            callback(false)
        }
    })
}

function getExistingUserInfos(mail,login,pseudo,callback){
    getExistingUser({mail:mail}, function(mailExists){
        getExistingUser({login:login}, function(loginExists){
            getExistingUser({pseudo:pseudo}, function(pseudoExists){
                var valid = !mailExists && !loginExists && !pseudoExists;
                
                callback({
                    mailExists:mailExists?mail:false,
                    loginExists:loginExists?login:false,
                    pseudoExists:pseudoExists?pseudo:false
                }, valid);
            })
        })
    })
}


////////////// public /////////////////


function initPassport(){
    passport.use(new LocalStrategy(
        function(username,password,done) {
            findUser(username, function (err,user){
                if(err){
                    return done("erreur:"+err)
                } 
                if(!user) {
                    console.log("can't find user")
                    return done(null, false)
                }
                if(password != user.password){
                    console.log('wrong password : '+password +" != "+user.password)
                    return done(null, false)
                }
                console.log(user.login +' is authenticated')
                return done(null, user)
            })
        }
    ))
}



/**
Render inscription
*/
function inscription(request, callback){

    if(request.body.password != request.body.password2){
        console.log('not the same password')
        callback({
            notSamePassword : true
        });
        return;
    }
    
    var object = {
        login:request.body.login.trim(),
        password:request.body.password,
        pseudo:request.body.pseudo.trim(),
        mail:request.body.email,
        privileges:[''],
        rank:'Utilisateur'
    };
    
    getExistingUserInfos(object.mail, object.login, object.pseudo, function(msg, valid){
        if(valid){
            mongo.add(object, UserSchema, function(err) {
                if(err){
                    console.log("erreur d'ajout :"+err)
                    callback({
                        error : true
                    });
                }
                else{
                    console.log('user ajouté avec succès');
                    callback( {
                        accountAdded : true
                    });
                }
            });
        }else{
            console.log("info already taken : " + msg)
            callback(msg);
        }
    })
    

}




module.exports = {
    initPassport,
    inscription
}