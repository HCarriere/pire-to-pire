const mongo = require('../app/mongo')
const UserSchema = require('../app/user').Schema
const Law = require('../app/user').law;
const utils = require('../app/utils');


function init(){
   
    var dataArray = [
        {
        login: "admin",
        password : 'b018ca4ecef9c155ac0cd81f840c193ef2cf364c090635cf677c7e8587d0ba21', 
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