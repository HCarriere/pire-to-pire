const conf = require('../config')
var mongoose = require('mongoose');
var conn;

function openConnection(callback){
   /*var conn = mongoose.createConnection(conf.database.name, function(err) {
        if (err) { 
            console.log(`(${conf.database.name}) : ${err}`)
            callback(null,err);
            //throw `Impossible de se connecter à la base ${conf.dev.database} : ${err}`; 
        }else{
            console.log('vvvvvvvvvvvv - connection opened - vvvvvvvvvvvv');
            callback(conn,null);
        }
    });  */ 
    if(!conn){
        var conn = mongoose.createConnection(conf.database.name, function(err) {
           if(!err){
               callback(conn,null)
           }
        })
    } else{
        callback(conn, null);
    }
}

function closeConnection(conn){
   // conn.close();
   // console.log('^^^^^^^^^^^^ - connection closed - ^^^^^^^^^^^^');
}



//CRUD

/**

*/
function addObject(object, schema, callback){   
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            var objectFromModel = new model(object);
            objectFromModel.save(function (err) {
                if (err) { 
                    throw err; 
                    callback(err);
                    closeConnection();
                }else{
                    console.log(`${JSON.stringify(objectFromModel)} has been added`);
                    callback(null);
                    closeConnection();
                }
            });      
        }else{
            callback(coErr);
        }
    })
}


function findObject(schema, jsonRequest, callback){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.find(jsonRequest, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                console.log(`objects retrieved (${JSON.stringify(jsonRequest)})`);
                closeConnection();
                callback(null, result);
            });
        }else{
            callback(coErr);
        }
    })
}

function findObjectWithOptions(schema, jsonRequest, limit, sort, callback){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.find(jsonRequest, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                console.log(`objects retrieved with options (${JSON.stringify(jsonRequest)})`);
                closeConnection();
                callback(null, result);
            })
            .limit(limit)
            .sort(sort);
        }else{
            callback(coErr);
        }
    })
}

function findOne(schema, jsonRequest, callback){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.findOne(jsonRequest, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                console.log(`one object retrieved (${JSON.stringify(jsonRequest)})`);
                closeConnection()
                callback(null, result);
            });
        }else{
            callback(coErr);
        }
    })
}

function updateObject(schema, condition, update, option, callback){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.update(condition, update, option, function(err){
                if (err) {
                    throw err; 
                    closeConnection();
                    callback(err);
                }
                console.log(`UPDATE ok : ${JSON.stringify(condition)} --> ${JSON.stringify(update)}`);
                closeConnection();
                callback(null);
            });
        }else{
            callback(coErr);
        }
    })
}


function removeObject(schema, condition, callback){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.remove(condition, function (err) {
               if (err) {
                   throw err;
                   closeConnection();
                   callback(err);
               }
                console.log(`REMOVE ok (${JSON.stringify(condition)})`);
                closeConnection();
                callback(err);
            });
        }else{
            callback(coErr);
        }
    })
}


function count(schema, condition, callback){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.count(condition , function(err, count){
                if(!err && count){
                    throw err;
                    closeConnection();
                    callback(count);
                    console.log(`count : ${count} (${JSON.stringify(condition)})`);
                }else {
                    closeConnection();
                    callback(null);
                }
            })
        }else{
            callback(coErr);
        }
    })
}





module.exports = {
    add: addObject,
    find: findObject,
    findOne: findOne,
    update: updateObject,
    remove: removeObject,
    count: count,
    findWithOptions : findObjectWithOptions
}


