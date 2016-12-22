const ShareableSchema = require('./schema').Schema
const mongo = require('../mongo')
const utils = require('../utils')

///////////// private

function getShortName(name){
    return name.replace(new RegExp("[^a-zA-Z ]+", "g"),'').trim().replace(/ /g,'-');
}

function getTags(tagsRequest){
    var r = [];
    var u = {};
    var tags = tagsRequest.trim().replace(/,/g,';').split(';');
    
    for (var tag in tags){
        var theTag = tags[tag].trim();
        if(theTag && !u.hasOwnProperty(theTag) ){
            r.push({tag:theTag});
            u[theTag] = 1;
        }
    }
    return r;
}

function getExtension(filename){
    return filename.split('.').pop();
}


function getHTMLContent(content){
    content = content.replace(/\n/g,'<br>');
    content = content.replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    content = content.replace(/\r/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    return content;
}

///////////// public
//callback(error, shortName)
//appellé lors de l'upload (au callback de réussite)
function addShareable(request, callback){
    
    if(!request.isAuthenticated() || !request.user.login){
        callback({error:'Non authentifié'},null);
        return;
    }
    
    if(!request.body.name || !request.body.description || !request.body.tags){
        callback({error:'Contenu vide'},null);
        return;
    }
    
    var object = {
        name:request.body.name.trim(),
        shortName:getShortName(request.body.name.trim()),
        description:request.body.description,
        tags:getTags(request.body.tags),
        author:request.user.login,
        uploadedObject : {
            name:"nope",
            location:request.file.filename,
            size:request.file.size,
            extension:getExtension(request.file.filename)
        },
        publicationDate:Date.now()
    }
    mongo.add(ShareableSchema, function(err,result){
        if(err){
            callback(err,null)    
        }else{
            callback(null,object.shortName)
        }
    },object)
}

function listShareables(limit, callback){
    mongo.findWithOptions(ShareableSchema, function(err, result){
        if(err){
            callback(err, null)
            return;
        }else{
            for(var share of result){
                share.stringPublicationDate = utils.getStringDate(share.publicationDate);
            }
            callback(null, result)
        }
    },{},limit,{publicationDate:-1})
}

function getShareable(shortName, callback){
    mongo.findOne(ShareableSchema, function (err, result) {
        if(result){
            result.stringPublicationDate = utils.getStringDate(result.publicationDate);
            result.description = getHTMLContent(result.description);
            callback(result);
            return;
        }
        callback(null);
        return;
    }, {shortName: shortName})
}

//middleware
function getAuthorPublications(){
    return function (request, response, next) {
        mongo.find(ShareableSchema, function(err, result) {
            if(result) {
                for(var share of result){
                    share.stringPublicationDate = utils.getStringDate(share.publicationDate);
                }
                request.shareables = result;
            }
            return next();
        })
    }
}

module.exports= {
    addShareable,
    listShareables,
    getShareable,
    getAuthorPublications
}