const db = require('../conf/db')
var mongoose = require('mongoose');







function getConnection(base){
    return mongoose.connect(base, function(err) {
        if (err) { throw `Impossible de se connecter à la base ${base}`; }
    });
}

//CRUD
function addObject(base,object){
    var connection = getConnection(`${db.BASE}/${base}`);
    
    //là
    connection.close();
}
