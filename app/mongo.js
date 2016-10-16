const conf = require('../config')
var mongoose = require('mongoose');


function openConnection(callback){
    mongoose.connect(conf.database.name, function(err) {
        if (err) { 
            console.log(`Impossible de se connecter à la base ${conf.database.name} : ${err}`)
            callback(err);
            //throw `Impossible de se connecter à la base ${conf.dev.database} : ${err}`; 
        }else{
            console.log('connection opened');
            callback(null);
        }
    });   
}

function closeConnection(){
    mongoose.connection.close();
    console.log('connection closed');
}

//CRUD

/**

*/
function addObject(objectFromModel, callback){   
    openConnection(function(coErr){
        if(!coErr){
            objectFromModel.save(function (err) {
                if (err) { 
                    throw err; 
                    callback(err);
                    closeConnection();
                }else{
                    console.log(`ADD ok`);
                    callback(null);
                    closeConnection();
                }
            });      
        }else{
            callback(coErr);
        }
    })
}

function findObject(model,jsonRequest, callback){
    openConnection(function(coErr){
        if(!coErr){
            model.find(jsonRequest, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                console.log(`object retrieved : ${result}`);
                closeConnection();
                callback(null, result);
            });
        }else{
            callback(coErr);
        }
    })
}

function findOne(model,jsonRequest, callback){
    openConnection(function(coErr){
        if(!coErr){
            model.findOne(jsonRequest, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                console.log(`one object retrieved : ${result}`);
                closeConnection()
                callback(null, result);
            });
        }else{
            callback(coErr);
        }
    })
}

function updateObject(model, condition, update, option, callback){
    openConnection(function(coErr){
        if(!coErr){
            model.update(condition, update, option, function(err){
                if (err) {
                    throw err; 
                    closeConnection();
                    callback(err);
                }
                console.log(`UPDATE ok`);
                closeConnection();
                callback(null);
            });
        }else{
            callback(coErr);
        }
    })
}


function removeObject(model, condition, callback){
    openConnection(function(coErr){
        if(!coErr){
            model.remove(condition, function (err) {
               if (err) {
                   throw err;
                   closeConnection();
                   callback(err);
               }
                console.log(`REMOVE ok`);
                closeConnection();
                callback(err);
            });
        }else{
            callback(coErr);
        }
    })
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
    findOne: findOne,
    update: updateObject,
    remove: removeObject
//    open: openConnection,
//    close: closeConnection
}



//var userBase = require('./app/user/schema')
//var mongo = require('./app/mongo')
//.get('/c', (request, response) => {
//    mongo.open();
//    
//    var object = new userBase.Model({
//        login:'Bob',
//        password:'123',
//        name:'namename',
//        privileges:['a','b'],
//        rank:'admin'
//    });
//    mongo.add(object);
//
//    mongo.close();
//    response.send('create');
//})
//.get('/r', (request, response) => {
//    mongo.open();
//    
//    mongo.find(userBase.Model,{
//        login:'Bob'
//    });
//
//    mongo.close();
//    response.send('read');
//})
//.get('/u', (request, response) => {
//    mongo.open();
//    
//    mongo.update(userBase.Model,
//        {
//        login:'Bob',
//        },{
//        password:'Alice'
//        }
//    ,null);
//
//    mongo.close();
//    response.send('update');
//})
//.get('/d', (request, response) => {
//    mongo.open();
//    
//    mongo.remove(userBase.Model,
//    {
//        login:'Bob'
//    });
//
//    mongo.close();
//    response.send('remove');
//});
//

//app.get('/projects/:id', (req, res) => {
//  req.param.id;
//})

