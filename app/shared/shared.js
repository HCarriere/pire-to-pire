const ShareableSchema = require('./schema').Schema
const mongo = require('../mongo')
const utils = require('../utils')
const config = require('../../config')

///////////// private



function getExtension(filename){
    var ext = filename.split('.').pop();
    var extDictionnary = [
  "aac","ai","aiff","avi","bmp","c","cpp","css","dat","dmg","doc","dotx","dwg","dxf","eps","exe","flv","gif","h","hpp","html","ics","iso","java","jpg","js","key","less","mid","mp3","mp4","mpg","odf","ods","odt","otp","ots","ott","pdf","php","png","ppt","psd","py","qt","rar","rb","rtf","sass","scss","sql","t.txt","tga","tgz","tiff","txt","wav","xls","xlsx","xml","yml","zip"
    ];
    if(extDictionnary.indexOf(ext) > -1){
        return ext;
    } else return "_blank";
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
				share.uploadedObject.stringSize = utils.getStringSize(share.uploadedObject.size);
            }
            callback(null, result)
        }
    },{},limit,{publicationDate:-1})
}

function getShareable(shortName, callback, editMode){
    mongo.findOne(ShareableSchema, function(err, result) {
        if(result){
            result.stringPublicationDate = utils.getStringDate(result.publicationDate);
			result.stringModificationDate = utils.getStringDate(result.modificationDate);
			result.uploadedObject.stringSize = utils.getStringSize(result.uploadedObject.size);
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
    }, {shortName: shortName})
}

function editShareable(request, callback) {
	console.log("editing..."+JSON.stringify(request.body))
	mongo.update(ShareableSchema, function(err, result) {
		callback(err, request.body.originalShortName)
	},
	{
		shortName: request.body.originalShortName
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
    getAuthorPublications,
	editShareable
}