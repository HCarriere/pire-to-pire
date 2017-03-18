const mongo = require('../app/mongo')
const UserSchema = require('../app/user').Schema
const Law = require('../app/user').law;



function init(){
   
    var dataArray = [
        {
        login: "admin2",
        password : "06f38b86c3fb68a5fe27d476314ce7cd", //123
       // pseudo: "admin2",
        fullName : "Admin",
        mail: "admin2@pire-to-pire.fr",
        rank:Law.roles.ADMIN.name,
        inscriptionDate : new Date(),
        
        geo: {
            country:"Québec",
            city:"Montréal"
        },
        privileges:Law.roles.ADMIN.defaultRights
    },
        {
        login: "user2",
        password : "06f38b86c3fb68a5fe27d476314ce7cd", //123
       // pseudo: "user2",
        fullName : "Ecrivain",
        mail: "ecrivain@pire-to-pire.fr",
        rank:Law.roles.WRITER.name,
        inscriptionDate : new Date(),
        
        geo: {
            country:"Québec",
            city:"Montréal"
        },
        privileges:Law.roles.WRITER.defaultRights
    },
        {
        login: "user1",
        password : "06f38b86c3fb68a5fe27d476314ce7cd", //123
       // pseudo: "user1",
        fullName : "Utilisateur",
        mail: "user@pire-to-pire.fr",
        rank:Law.roles.USER.name,
        inscriptionDate : new Date(),
        
        geo: {
            country:"France",
            city:"Lyon"
        },
        privileges:Law.roles.USER.defaultRights
    },
        {
        login: "pecno",
        password : "06f38b86c3fb68a5fe27d476314ce7cd", //123
       // pseudo: "pecno",
        fullName : "Pecore",
        mail: "pecore@hotmail.fr",
        rank:"pecore de base",
        inscriptionDate : new Date(),
        
        geo: {
            country:"France",
            city:"Paris"
        }
    }]
    
    mongo.processFunction(mongo.add, UserSchema, dataArray, 0, function(){
        process.exit();
    })
}

init();