const ShareableSchema = require('./schema').Schema
const mongo = require('../mongo')
const utils = require('../utils')
const config = require('../../config')

///////////// private


function getExtension(filename) {
    var ext = filename.split('.').pop();
    var extDictionnary = [
  "aac","ai","aiff","avi","bmp","c","cpp","css","dat","dmg","doc","dotx","dwg","dxf","eps","exe","flv","gif","h","hpp","html","ics","iso","java","jpg","js","key","less","mid","mp3","mp4","mpg","odf","ods","odt","otp","ots","ott","pdf","php","png","ppt","psd","py","qt","rar","rb","rtf","sass","scss","sql","t.txt","tga","tgz","tiff","txt","wav","xls","xlsx","xml","yml","zip"
    ];
    if(extDictionnary.indexOf(ext) > -1){
        return ext;
    } else return "_blank";
}

function formatShared(shared) {
	shared.stringPublicationDate = utils.getStringDate(shared.publicationDate);
	shared.uploadedObject.stringSize = utils.getStringSize(shared.uploadedObject.size);
	shared.extract = utils.getExtractOf(shared.description);
	shared.stringModificationDate = utils.getStringDate(shared.modificationDate);
	shared.upvoteNumber = shared.upvotes.length;
	shared.downvoteNumber = shared.downvotes.length;
	return shared;
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
	
	if(request.file.size>=config.upload.documents.maxSize){
        callback({error:'Fichier trop volumineux'},null);
        return;
    }
	
    var object = {
        name:request.body.name.trim(),
        shortName:utils.getShortName(request.body.name.trim()),
        description:request.body.description,
        tags: utils.getTags(request.body.tags),
        author:request.user.login,
        uploadedObject : {
            name:request.file.originalname,
            location:request.file.filename,
            size:request.file.size,
            extension:getExtension(request.file.filename)
        },
        publicationDate:Date.now()
    }
    
    mongo.count(ShareableSchema, function(err, count){
        object.id = count+1;
        mongo.add(ShareableSchema, function(err,result){
            if(err){
                callback(err,null)    
            }else{
                callback(null,object.id)
            }
        },object);
    }, {});
}

function listShareables(limit, callback, offset){
    mongo.count(ShareableSchema, function(err, count){
        mongo.findWithOptions(ShareableSchema, function(err, result){
            if(err){
                callback(err, null)
                return;
            }else{
                for(var share of result){
                    formatShared(share);
                }
                callback(null, result, count);
            }
        },{},limit,{publicationDate:-1},offset)
    }, {});
}

function getShareable(id, callback, editMode){
    mongo.findOne(ShareableSchema, function(err, result) {
        if(result){
            formatShared(result);
            for(var comment of result.comments) {
                comment.stringDate = utils.getStringDate(comment.date);
            }
            result.comments.sort(function(a,b) {
                return b.date - a.date;
            });
			if(editMode){
				result.description = utils.getTextContentFromHTML(result.description);
			}else{
				result.description = utils.getHTMLContent(result.description);
			}
            callback(result);
            return;
        }
        callback(null);
        return;
    }, {id: id})
}

function editShareable(request, callback) {
	console.log("editing..."+JSON.stringify(request.body))
	mongo.update(ShareableSchema, function(err, result) {
		callback(err, request.body.originalId)
	},
	{
		id: request.body.originalId
	},//condition
	{
		modificationDate: Date.now(),
		name: request.body.name.trim(),
		tags: utils.getTags(request.body.tags),
		description:request.body.description
	},//update
	{})//options
}


//middleware
function getAuthorPublications(){
    return function (request, response, next) {
        mongo.find(ShareableSchema, function(err, result) {
            if(result) {
                for(var share of result){
                    formatShared(share);
                }
                request.shareables = result;
            }
            return next();
        },{author:request.params.id})
    }
}

// callback(err, data)
function commentShareable(request, callback) {
    if(!request.body.comment) {
        callback('Commentaire vide.',{redirect:'/'});
        return;
    }
    var sharedId = request.body.sharedId;
    
    mongo.update(ShareableSchema, function(err, result) {
		callback(err, {
            redirect:'/shared/'+sharedId
        });
	},
	{
		id: sharedId
	},//condition
	{$push: {'comments': {
            content:request.body.comment,
            author:request.user.login,
            date: new Date(),
        }
    }},//update
	{safe: true, upsert: true, new : true})//options
}


/**
POST params:
sharedid: String,
downvote: Boolean
*/
function vote(request, callback) {
	if(!request.body) {
		callback({error:'Request invalid'});
		return;
	}
	mongo.findOne(ShareableSchema, (err, shared) => {
		if(err  || !shared) {
			callback({error:err});
			return;
		}
		
		var update = {};
		var author = request.user.login;
		
		if(shared.downvotes.indexOf(author) != -1 ||
		   shared.upvotes.indexOf(author) != -1) {
			callback({error:'Vous avez déjà voté!'});
			return;
		}
		
		if(request.body.downvote) {
			update = {$push: {'downvotes': author}};
		} else {
			update = {$push: {'upvotes': author}};
		}
		
		mongo.update(ShareableSchema, (uErr, uRes) => {
			if(uErr) {
				callback({error:uErr});
				return;
			}
			callback({result: 'OK'});
		},
		{id: request.body.sharedid},// condition
		update,
		{safe: true, upsert: true, new : true});// options
	}, {id: request.body.sharedid});
}

module.exports= {
    addShareable,
    listShareables,
    getShareable,
    getAuthorPublications,
	editShareable,
    commentShareable,
	vote,
}