//app/connect/connect.js

const passport = require('passport')  
const LocalStrategy = require('passport-local').Strategy
const UserModel = require('../user').Model
const mongo = require('../mongo')


function findUser(username, callback){
   
    mongo.findOne(UserModel, {
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
function inscription(request){
    
    if(request.body.password === request.body.password2){

        var object = new UserModel({
            login:request.body.login,
            password:request.body.password,
            mail:request.body.email,
            privileges:[''],
            rank:'Utilisateur'
        });
        
        mongo.add(object, function(err){
            if(err){
                console.log("erreur d'ajout")
                return 
                {
                    error : true
                };
            }
            else{
                console.log('objet ajouté avec succès');
                return 
                {
                    accountAdded : true
                };
            }
        });
        
    }else{
        return 
        {
            notSamePassword : true
        };
    }
}



module.exports = {
    initPassport,
    inscription
}