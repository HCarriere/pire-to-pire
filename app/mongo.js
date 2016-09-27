const conf = require('../config')
var mongoose = require('mongoose');

function openConnection(){
    mongoose.connect(conf.dev.database, function(err) {
        if (err) { throw `Impossible de se connecter à la base ${conf.dev.database} : ${err}`; }
    });
}

function closeConnection(){
    mongoose.connection.close();
}

//CRUD
function addObject(objectFromModel){
    console.log(objectFromModel);
    objectFromModel.save(function (err) {
        if (err) { throw err; }
        console.log(`ADD ok`);
    });
    
}


function findObject(model,jsonRequest){
    
    model.find(jsonRequest, function (err, result) {
        if(err) { throw err; }
        
        console.log(`object retrieved : ${result}`);
        
        return result;
    });
    
}


function updateObject(model, condition, update, option){
    
    model.update(condition, update, option, function(err){
        if (err) {throw err; }
        console.log(`UPDATE ok`);
    });
    
}


function removeObject(model, condition){
    
    model.remove(condition, function (err) {
       if (err) {throw err;}
        console.log(`REMOVE ok`);
    });
    
}

//module.exports.addObject = addObject
//module.exports.findObject = findObject
//module.exports.updateObject = updateObject
//module.exports.removeObject = removeObject
//
//module.exports.openConnection = openConnection
//module.exports.closeConnection = closeConnection

module.exports = {
    add: addObject,
    find: findObject,
    update: updateObject,
    remove: removeObject,
    open: openConnection,
    close: closeConnection
}