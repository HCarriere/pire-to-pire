const mongo = require('../app/mongo')
const UserSchema = require('../app/user').Schema




function init(){
   
    var dataArray = [
        {
        login: "admin",
        password : "e64b78fc3bc91bcbc7dc232ba8ec59e0", 
        pseudo: "admin",
        fullName : "Pire-to-pire Administrator",
        mail: "admin@pire-to-pire.fr",
        rank:"god",
        inscriptionDate : new Date(),
        
        geo: {
            country:"France",
            city:"Lyon"
        },
        privileges : [
            {privilege:"bo_remove_user"},
            {privilege:"bo_access"},
            {privilege:"article_post"}
        ]
        
    }]
    
    mongo.processFunction(mongo.add, UserSchema, dataArray, 0, function(){
        process.exit();
    })
}

init();