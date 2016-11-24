const mongo = require('../app/mongo')
const UserSchema = require('../app/user').Schema




function init(){
   
    var dataArray = [{
        login: "user2",
        password : "202cb962ac59075b964b07152d234b70", //123
        pseudo: "user2",
        fullName : "Ecrivain",
        mail: "ecrivain@pire-to-pire.fr",
        rank:"writer",
        inscriptionDate : new Date(),
        
        geo: {
            country:"Québec",
            city:"Montréal"
        },
        privileges:[
            {privilege:"create_articles"}
        ]
    },
        {
        login: "user1",
        password : "202cb962ac59075b964b07152d234b70", //123
        pseudo: "user1",
        fullName : "Utilisateur",
        mail: "user@pire-to-pire.fr",
        rank:"user",
        inscriptionDate : new Date(),
        
        geo: {
            country:"France",
            city:"Lyon"
        },
        privileges:[
            {privilege:"create_articles"}
        ]
    },
        {
        login: "pecno",
        password : "202cb962ac59075b964b07152d234b70", //123
        pseudo: "pecno",
        fullName : "Pecore",
        mail: "pecore@hotmail.fr",
        rank:"user",
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