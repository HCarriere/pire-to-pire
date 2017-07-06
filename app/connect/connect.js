//app/connect/connect.js

const passport = require('passport')  
const LocalStrategy = require('passport-local').Strategy
const UserSchema = require('../user').Schema
const Law = require('../user').law
const mongo = require('../mongo')
const utils = require('../utils')
////////////// private ////////////////


function findUser(username, callback){
   
    mongo.findOne(UserSchema , function(err, result){
        if(err){
            callback(err, null);
        } else {
            callback(null, result);
        }
    },{'login': {$regex: new RegExp('^' + username.toLowerCase(), 'i')}});
    
}

passport.serializeUser(function (user, cb) {
  cb(null, user.login)
})

passport.deserializeUser(function (username, cb) {
  findUser(username, cb)
})

function getExistingUser(condition, callback){
    mongo.findOne(UserSchema, function(err, result){
        if(result){
            callback(true)
        }else{
            callback(false)
        }
    },condition)
}

function getExistingUserInfos(mail,login,callback){
    getExistingUser({mail:mail}, function(mailExists){
        getExistingUser({login:login}, function(loginExists){
            var valid = !mailExists && !loginExists;

            callback({
                mailExists:mailExists?mail:false,
                loginExists:loginExists?login:false
            }, valid);
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
                    console.log("ptp:connection:():initPassport:ERR:(can't find user)")
                    return done(null, false)
                }
                if(utils.encryptPassword(password) != user.password){
                    console.log(utils.encryptPassword(password));
                    console.log(password);
                    console.log('ptp:connection:():initPassport:WARN:(wrong password)');
                    return done(null, false);
                }
                console.log("ptp:connection:():initPassport->findUser:OK:("+username +" is authenticated)")
                return done(null, user)
            })
        }
    ))
	console.log("ptp:connection:():initPassport:OK:(passport is initialized)")
}



/**
Render inscription
*/
function inscription(request, callback){

    if(request.body.password != request.body.password2){
        console.log('ptp:connection:():inscription:WARN:(not the same password)')
        callback({
            notSamePassword : true
        });
        return;
    }
    
    var object = {
        login:request.body.login.trim(),
        password:utils.encryptPassword(request.body.password),
        //pseudo:request.body.pseudo.trim(),
        mail:request.body.email,
        privileges:Law.roles.USER.defaultRights,
        rank:Law.roles.USER.name
    };
    
    getExistingUserInfos(object.mail, object.login, function(msg, valid){
        if(valid){
            mongo.add(UserSchema, function(err,result) {
                if(err){
                    console.log("ptp:connection:():inscription:ERR:(erreur d'ajout):"+err)
                    callback({
                        error : true
                    });
                }
                else{
                    console.log('ptp:connection:():inscription:OK:(user '+object.login+' ajouté avec succès)');
                    callback( {
                        accountAdded : true
                    });
                }
            },object);
        }else{
            console.log("ptp:connection:():inscription:WARN:(mail/login already took) : " + msg)
            callback(msg);
        }
    })
    

}




module.exports = {
    initPassport,
    inscription
}