const mongo = require('../app/mongo')
const UserSchema = require('../app/user').Schema




function init(){
   
    var dataArray = [{
        login: "admin",
        password : "202cb962ac59075b964b07152d234b70", //123
        pseudo: "admin1",
        fullName : "Administrateur",
        mail: "admin@pire-to-pire.fr",
        
        inscriptionDate : new Date(),
        
        geo: {
            country:"Québec",
            city:"Montréal"
        }
    },
        {
        login: "user",
        password : "202cb962ac59075b964b07152d234b70", //123
        pseudo: "user1",
        fullName : "Utilisateur",
        mail: "user@pire-to-pire.fr",
        
        inscriptionDate : new Date(),
        
        geo: {
            country:"France",
            city:"Lyon"
        }
    }]
    
    mongo.processFunction(mongo.add, UserSchema, dataArray, 0, function(){
        process.exit();
    })
}

init();