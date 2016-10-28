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



/*********
function are always :
function X(schema, callback, ...., .... )
callback are always : (err,result)
**********/


function addObject(schema, callback, object){   
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            var objectFromModel = new model(object);
            objectFromModel.save(function (err) {
                if (err) { 
                    throw err; 
                    callback(err, null);
                    closeConnection();
                }else{
                    console.log(`an object has been added`);
                    callback(null, 'Insert ok');
                    closeConnection();
                }
            });      
        }else{
            callback(coErr, null);
        }
    })
}


function findObject(schema, callback, jsonRequest){
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
            callback(coErr, null);
        }
    })
}

function findObjectWithOptions(schema,callback, jsonRequest, limit, sort){
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
            callback(coErr, null);
        }
    })
}

function findOne(schema, callback, jsonRequest){
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
            callback(coErr, null);
        }
    })
}

function updateObject(schema,callback, condition, update, option){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.update(condition, update, option, function(err){
                if (err) {
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                console.log(`UPDATE ok : ${JSON.stringify(condition)} --> ${JSON.stringify(update)}`);
                closeConnection();
                callback(null, 'update ok');
            });
        }else{
            callback(coErr, null);
        }
    })
}


function removeObject(schema, callback, condition){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.remove(condition, function (err) {
               if (err) {
                   throw err;
                   closeConnection();
                   callback(err, null);
               }
                console.log(`REMOVE ok (${JSON.stringify(condition)})`);
                closeConnection();
                callback(err, 'remove ok');
            });
        }else{
            callback(coErr, nulll);
        }
    })
}


function count(schema,callback, condition){
    openConnection(function(conn,coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.count(condition , function(err, count){
                if(!err && count){
                    throw err;
                    closeConnection();
                    callback(null, count);
                    console.log(`count : ${count} (${JSON.stringify(condition)})`);
                }else {
                    closeConnection();
                    callback(err, null);
                }
            })
        }else{
            callback(coErr, null);
        }
    })
}



/**
methode de test. envoi de maniere recursive des données dans la DB
mongoOperation : 1 seule opération
schema : 1 seul schema
dataArray plusieurs object dans le dataArray
current : par ou commence l'array
onDone() : action executée à la fin
*/
function processFunction(mongoOperation, schema, dataArray, current, onDone){
    console.log('operation '+(current+1)+'/'+dataArray.length+':')
    if(current >= dataArray.length || current < 0){
        console.log('done.')
        onDone();
        return ;
    }
    console.log('operating '+current+'...')
    mongoOperation(schema, function(err, result){
        if(err){
            console.log('error on '+current)
        }else{
            console.log('operation '+current+' executed with success !')
            console.log('--------------')
        }
        
        processFunction(mongoOperation, schema, dataArray, current + 1, onDone)
    } , dataArray[current]);
}




module.exports = {
    add: addObject,
    find: findObject,
    findOne: findOne,
    update: updateObject,
    remove: removeObject,
    count: count,
    findWithOptions : findObjectWithOptions,
    processFunction : processFunction
}


