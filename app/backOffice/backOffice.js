var user    = require('../user')
var article = require('../article')
var shared = require('../shared')
var mongo   = require('../mongo')

////////////////////// PRIVATE //////////////


function getLinkByFields(link, object){
    //%XXX%
    if(!link){
        return;
    }
    var array = link.split('%');
    var string="";
    for(a = 0; a<array.length; a++){
        if(a%2==0){
            string+=array[a];
        }else{
            if(object[array[a]]){
                string+=object[array[a]];
            }
        }
    }
    return string;
}

/////////////// PUBLIC ///////////////

function getAsTable(objectSet, tableModel){
    var admin = {};
    admin = tableModel;
    var lines = [];
    for(i=0; i<objectSet.length; i++){
        var datas = [];
        for(j=0; j<tableModel.columns.length; j++){
            var data = {};
            data.text = objectSet[i][tableModel.columns[j].value];
            data.action = tableModel.columns[j].action;
            data.input = tableModel.columns[j].input;
            data.id = tableModel.columns[j].id;
            //if(tableModel.columns[j].link){
            data.link = getLinkByFields(tableModel.columns[j].link, objectSet[i]);
            data.class = tableModel.columns[j].class;
            data.attributes = tableModel.columns[j].attributes;
                //console.log(tableModel.columns[j].link+" --- "+objectSet[i])
            //}
            if(!data.text){
                data.text = tableModel.columns[j].text;
            }
            datas.push(data);
            datas.uid = Math.random().toString().substring(2);
        }
        lines.push(datas);
    }
    admin.lines = lines;
    //console.log(JSON.stringify(admin))
    return admin;
}

//callback(err)
/*
Seul dieu peux promouvoir en admin
Seul dieu peux dégrader un admin
x Si un rang n'est pas officiel, les privileges ne changent pas
x Personne ne peux promouvoir en Dieu
x Personne ne peux descendre un Dieu
*/
function updateUserRank(request, callback){
    var rank = request.profile.rank;
    var requestedRank = request.body.rank;
    var requestedPrivileges = user.getDefaultPrivilegesFromRole(request.body.rank);
    
    if(user.law.roles.GOD.name === requestedRank){
        //dieu
        callback("Impossible de promouvoir en Dieu")
        return;
    }
    
    mongo.findOne(user.Schema, function(err, result){
        if(!err){
            var ranksCurrentTarget = result.rank;
            if(user.law.roles.GOD.name === ranksCurrentTarget) {
                //target is GOD
                callback("Impossible de toucher à Dieu");
                return;
            } else if(user.law.roles.ADMIN.name === ranksCurrentTarget) {
                //target is ADMIN
                if(user.law.roles.GOD.name === rank) {
                    //we are GOD
                    promoteUser(request.body.login, requestedRank, requestedPrivileges, callback);
                } else {
                    callback("Seul Dieu peux dégrader un admin")
                }
            } else {
                //target is PEON
                if(user.law.roles.ADMIN.name === requestedRank) {
                    //on veux transformer en ADMIN
                    if(user.law.roles.GOD.name === rank) {
                        //we are GOD
                        promoteUser(request.body.login, requestedRank, requestedPrivileges, callback);
                    }else{
                        callback("Seul Dieu peux promouvoir en admin")
                    }
                } else {
                    promoteUser(request.body.login, requestedRank, requestedPrivileges, callback);
                }
            }
        } else {
            callback(err);
        }
    },{login: request.body.login});
}

//assuming everything is permitted
function promoteUser(login, requestedRank, requestedPrivileges, callback) {
     if(requestedPrivileges){
        mongo.update(user.Schema, function(err,result){
            callback(err);
        },{
            login:login
        },{   
            rank: requestedRank,
            privileges:requestedPrivileges
        },{ })
    } else {
         mongo.update(user.Schema, function(err,result){
            callback(err);
        },{
            login:login
        },{   
            rank: requestedRank
        },{ })
    }
}

//callback(err)
function deleteUser(request, callback){
    mongo.remove(user.Schema, function(err,result){
        callback(err)
    },{login:request.body.login})
}

//callback(err)
function deleteArticle(request, callback){
    mongo.removeById(article.Schema, function(err,result){
        callback(err)
    },request.body.id)
}

//callback(err)
function deleteShareable(request, callback){
    mongo.removeById(shared.Schema, function(err,result){
        callback(err)
    },request.body.id)
}

///////// MODELS ///////////

var UserTableModel = {
    title:'Utilisateurs',
	selected:{
		users:"selected"	
	},
    addHtmlAfter:"userDescription",
    columns:[
        {
            text:"Login",   //nom de la colonne 
            value:'login',  //recupéré depuis la BDD (field)
            id:"login",     //id input
            input:'text',      //type input (si null-> pas d'input)
            link:'/user/%login%',
            attributes:'readonly'
        },
        {
            text:"E-mail",
            value:'mail',
            id:"email",
            input:null
        },
        {
            text:"Rang",
            value:'rank',
            id:"rank",
            input:'text'
        },
        {
            text:"Modifier",
            id:"update",
            input:"submit",
            action:"/api/promote/user",
            class:'button'
        },
        {
            text:"Supprimer",
            id:"delete",
            input:"submit",
            action:"/api/delete/user", //si input -> submit, formaction="action"
            class:'button danger' //ajoute une classe
        }
    ]
};

var ArticleTableModel = {
    title:'Articles',
	selected:{
		articles:"selected"	
	},
    columns:[
        {
            text:"ID",
            value:'id',
            id:'id',
            input:'text',
            attributes:'readonly'
        },
        {
            text:"Titre",
            value:'name',
            id:'title',
            input:null,
            link:'/article/%shortName%' //devient un <a>, %XXX% avec XXX-> BDD field
        },
        {
            text:"Auteur",
            value:'author',
            id:'author',
            input:null
        },
        {
            text:"Date",
            value:'publicationDate',
            id:'date',
            input:null
        },
        {
            text:"Supprimer",
            id:'delete',
            input:"submit",
            action:"/api/delete/article",
            class:"button danger"
        }
    ]
}


var NewsTableModel = {
    title:'News',
	selected:{
		news:"selected"	
	},
    buttons:[
        {
            link:'/new/news',
            label:'Ajouter',
            class:'button add'
        }
    ],
    columns:[
        {
            text:"ID",
            value:'id',
            id:'id',
            input:'text',
            attributes:'readonly'
        },
        {
            text:"Titre",
            value:'name',
            id:'title',
            input:null,
            link:'/article/%shortName%' //devient un <a>, %XXX% avec XXX-> BDD field
        },
        {
            text:"Auteur",
            value:'author',
            id:'author',
            input:null
        },
        {
            text:"Date",
            value:'publicationDate',
            id:'date',
            input:null
        },
        {
            text:"Supprimer",
            id:'delete',
            input:"submit",
            action:"/api/delete/news",
            class:"button danger"
        }
    ]
}

var ShareableTableModel ={
    title:'Partages',
	selected:{
		shareables:"selected"	
	},
    columns:[
        {
            text:"ID",
            value:'id',
            id:'id',
            input:'text',
            attributes:'readonly'
        },
        {
            text:"Titre",
            value:'name',
            id:'title',
            input:null,
            link:'/shared/%shortName%' //devient un <a>, %XXX% avec XXX-> BDD field
        },
        {
            text:"Auteur",
            value:'author',
            id:'author',
            input:null
        },
        {
            text:"Date",
            value:'publicationDate',
            id:'date',
            input:null
        },
        {
            text:"Supprimer",
            id:'delete',
            input:"submit",
            action:"/api/delete/shareables",
            class:"button danger"
        }
    ]
}
// EXPORTS

module.exports = {
    getAsTable,
    UserTableModel,
    ArticleTableModel,
    ShareableTableModel,
    NewsTableModel,
    updateUserRank,
    deleteUser,
    deleteArticle,
    deleteShareable
}

