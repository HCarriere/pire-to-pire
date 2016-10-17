//app/connect/connect.js

const passport = require('passport')  
const LocalStrategy = require('passport-local').Strategy
const UserSchema = require('../user').Schema
const mongo = require('../mongo')


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

    if(request.body.password === request.body.password2){

        var object = new UserSchema.schema({
            login:request.body.login,
            password:request.body.password,
            mail:request.body.email,
            privileges:[''],
            rank:'Utilisateur'
        });
        
        mongo.add(object, function(err){
            if(err){
                console.log("erreur d'ajout :"+err)
                callback( {
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
        console.log('not the same password')
        callback({
            notSamePassword : true
        });
    }

}



module.exports = {
    initPassport,
    inscription
}