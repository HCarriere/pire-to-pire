const mongo = require('../app/mongo')
const UserSchema = require('../app/user').Schema
const Law = require('../app/user').law;



function init(){
   
    var dataArray = [
        {
        login: "admin",
        password : "34b922f60e69f63fe3c1c001e267d6e6", 
        //pseudo: "admin",
        fullName : "Pire-to-pire Administrator",
        mail: "admin@pire-to-pire.fr",
        rank:Law.roles.GOD.name,
        inscriptionDate : new Date(),
        
        geo: {
            country:"France",
            city:"Lyon"
        },
        privileges : Law.roles.GOD.defaultRights
        
    }]
    
    mongo.processFunction(mongo.add, UserSchema, dataArray, 0, function(){
        process.exit();
    })
}

init();