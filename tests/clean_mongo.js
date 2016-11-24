const mongo = require('../app/mongo')
const ArticleSchema = require('../app/article').Schema
const UserSchema = require('../app/user').Schema


function init(){
    mongo.remove(ArticleSchema,{} , function(err){
        if(!err){
            console.log("destroy articles OK")
        }else{
            console.log(err)
        }
        mongo.remove(UserSchema,{} , function(err){
            if(!err){
                console.log("destroy users OK")
                process.exit();
            }else{
                process.exit();
            }
        })
    })
 
    
}

init();
