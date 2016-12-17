const conf = require('../config')
var mongoose = require('mongoose');
var conn;

function initMongo(){
	mongoose.set('debug', conf.database.mongooseDebug);
	logMsg("ptp:mongo:():initMongo:OK:(mongo initialized)");
}

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
		var options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } }, 
                replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };       

        conn = mongoose.createConnection(conf.database.name, options, function(err) {
           if(!err){
               callback(null)
			   logMsg("ptp:mongo:():openConnection:OK:(mongo connected to "+conf.database.name+" )");
           }else{
			   callback(err)
			   logMsg("ptp:mongo:():openConnection:ERR:(mongo is unable to connect to "+conf.database.name+" )");
			   return;
		   }
        })
		
    } else{
        callback(null);
    }
}

function closeConnection(conn){
   // conn.close();
   // console.log('^^^^^^^^^^^^ - connection closed - ^^^^^^^^^^^^');
}

function logMsg(msg){
	if(conf.database.verbose){
		console.log(msg);
	}
}


/*********
function are always :
function X(schema, callback, ...., .... )
callback are always : (err,result)
**********/


function addObject(schema, callback, object){   
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            var objectFromModel = new model(object);
            objectFromModel.save(function (err) {
                if (err) { 
                    throw err; 
                    callback(err, null);
                    closeConnection();
                }else{
                    logMsg("ptp:mongo:():addObject:OK:(Object added to "+schema.collection+")");
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
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.find(jsonRequest, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                logMsg("ptp:mongo:():findObject:OK:("+result.length+" object found in "+schema.collection+")");
                closeConnection();
                callback(null, result);
            });
        }else{
            callback(coErr, null);
        }
    })
}

function findObjectWithOptions(schema,callback, jsonRequest, limit, sort){
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.find(jsonRequest, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                logMsg("ptp:mongo:():findObjectWithOptions:OK:("+result.length+" object found in "+schema.collection+")");
                closeConnection();
                callback(null, result);
            })
            .limit(limit)
            .sort(sort)
			;
        }else{
            callback(coErr, null);
        }
    })
}

function findOne(schema, callback, jsonRequest){
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.findOne(jsonRequest, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                logMsg("ptp:mongo:():findOne:OK:(object found in "+schema.collection+")");
                closeConnection()
                callback(null, result);
            });
        }else{
            callback(coErr, null);
        }
    })
}

function findById(schema, callback, id){
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.findById(id, function (err, result) {
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                logMsg("ptp:mongo:():findById:OK:(object found in "+schema.collection+" with id "+id+")");
                closeConnection()
                callback(null, result);
            });
        }else{
            callback(coErr, null);
        }
    })
}

function removeById(schema, callback, id){
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.findById(id).remove(function(err,result){
                if(err) { 
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                logMsg("ptp:mongo:():removeById:OK:("+result.length+" objects removed with id "+id+")");
                closeConnection()
                callback(null, result);
            });
        }else{
            callback(coErr, null);
        }
    })
}

function updateObject(schema,callback, condition, update, option){
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.update(condition, update, option, function(err){
                if (err) {
                    throw err; 
                    closeConnection();
                    callback(err, null);
                }
                logMsg(`ptp:mongo:():updateObject:OK:(update ok : ${JSON.stringify(condition)} --> ${JSON.stringify(update)})`);
                closeConnection();
                callback(null, 'update ok');
            });
        }else{
            callback(coErr, null);
        }
    })
}


function removeObject(schema, callback, condition){
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.remove(condition, function (err) {
                if (err) {
                   throw err;
                   closeConnection();
                   callback(err, null);
                }
                logMsg(`ptp:mongo:():updateObject:OK:(remove ok (${JSON.stringify(condition)}))`);
                closeConnection();
                callback(err, 'remove ok');
            });
        }else{
            callback(coErr, nulll);
        }
    })
}


function count(schema,callback, condition){
    openConnection(function(coErr){
        if(conn){
            var model = conn.model(schema.collection,schema.schema);
            model.count(condition , function(err, count){
                if(!err && count){
                    throw err;
                    closeConnection();
                    callback(null, count);
                    logMsg(`ptp:mongo:():updateObject:OK:( ${count} object have ${JSON.stringify(condition)})`);
                }else {
                    closeConnection();
                    callback(err, null);
                }
            });
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
    if(current >= dataArray.length || current < 0){
        console.log('done.')
        onDone();
        return ;
    }
    console.log('operation '+(current+1)+'/'+dataArray.length+':')
    console.log('operating '+(current+1)+'...')
    mongoOperation(schema, function(err, result){
        if(err){
            console.log('error on '+(current+1))
        }else{
            console.log('operation '+(current+1)+' executed with success !')
            console.log('--------------')
        }
        processFunction(mongoOperation, schema, dataArray, current + 1, onDone)
    } , dataArray[current]);
}


var ObjectId = mongoose.Schema.Types.ObjectId;

module.exports = {
	initMongo : initMongo,
    add: addObject,
    find: findObject,
    findOne: findOne,
    findById: findById,
    update: updateObject,
    remove: removeObject,
    removeById: removeById,
    count: count,
    findWithOptions : findObjectWithOptions,
    ObjectId : ObjectId,
    processFunction : processFunction
}


