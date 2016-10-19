const UserSchema = require('./schema').Schema
const mongo = require('../mongo')


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

//POST : request.body.*
function updateUserInfo(request, callback){
    if(!request.isAuthenticated()){
       callback(null)
    }
    var login =  request.user.login;
    
    mongo.update(
        UserSchema,
        {
            //conditions
            login:login 
        },
        {
            //update
            fullName:request.body.fullName,
            pseudo: request.body.pseudo,
            geo:{
                country: request.body.geo_country,
                city:request.body.geo_city
            }
        },
        { /*options*/ },
        function(err){
        callback(err)
    });
    
}


module.exports = {
    getUserInfo: getUserInfo,
    updateUserInfo: updateUserInfo
}