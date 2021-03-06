'use strict';
// server.js

//imports
const express   = require('express')
const session   = require('express-session')
const exphbs    = require('express-handlebars')
const http		= require('http')
const path      = require('path')
const passport  = require('passport')
const multer    = require('multer')
const bodyParser= require('body-parser')
const md5 		= require('md5');

//General conf
const mongo     = require('./app/mongo')
const config    = require('./config') //config file
const app       = express();
const port      = process.env.PORT || config.server.port;
const server 	= http.createServer(app);

const sessionID = md5(Math.random());

//Express configuration
app
.use(express.static(__dirname + '/views/assets'))   //styles
.use('/uploads', express.static(__dirname + '/uploads'))        //uploads
.use(session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false
}));

//Other configurations
app
.use(passport.initialize())
.use(passport.session())
.use(bodyParser.json())        // to support JSON-encoded bodies
.use(bodyParser.urlencoded({    // to support URL-encoded bodies
  extended: true
}));


var handlebars = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname,'views/layouts'),
    helpers: {
		//{{#ifContains privileges 'create_articles'}} interieur {{/ifContains}}
        ifContains: function(context, options, out) { 
            if(!context){
                return "";
            }
            if(context === options){
                return out.fn(this);
            }
            for(var i=0; i<context.length; i++){
                if(context[i].privilege === options){
                    //contains
                    return out.fn(this);
                }
            }
        },
        
    }
});

//handlebars configuration
app
.engine('.hbs', handlebars.engine)
.set('view engine', '.hbs')
.set('views', path.join(__dirname, 'app'))



//Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, './uploads');
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now()+ file.originalname);
    }
});
var uploadImage = multer({
    storage : storage
},{
    limits: {
        files: 1,
        fields: 5,
        fileSize: config.upload.image.maxSize
    }
}).single('profile_picture');

var uploadDocument = multer({
    storage: storage
},{
    limits: {
        files:1,
        fields: 5,
        fileSize: config.upload.documents.maxSize
    }
}).single('document_upload');


/////////// indexes ///////////
var connect = require('./app/connect')
var article = require('./app/article')
var user    = require('./app/user')
var home    = require('./app/home')
var search  = require('./app/search')
var BO      = require('./app/backOffice')
var chat 	= require('./app/chat')
var shared  = require('./app/shared')
var inbox 	= require('./app/inbox')

/////////// inits ///////////
connect.init();
chat.init(server, sessionID);
mongo.initMongo();

///////////////////////////
//						 //
//  -   R O U T E S   -  //
//						 //
///////////////////////////

app

////////// GLOBAL //////////

.use(
	user.getUserPrivileges(),
    inbox.getUnseenMessagesCount(),
	csrf()
	)

////////// FRONT //////////

//home

.get('/', 
     home.getHomeLastNews(), 
     home.getHomeArticles(), 
     home.getHomeShareables(), 
     chat.fetchPreviousChatMessages(config.chat.limitPrevious),
     (request, response) => {
    response.render('home/home',{
        global:getParameters(request),
		otherScripts:[{script:"/socket.io/socket.io.js"},
					  {script:"/js/chatClient.js"},
                      {script:"/js/fireworks.js"}],
		previousChatMessage: request.previousChatMessage,
		keyAuth: getKeyFromLogin(request.userLogin),
        articles : request.articles,
		userLogin : request.userLogin,
		news: request.news,
        shareables: request.shareables
    })
})
//edit profile
.get('/profile/options', 
	mustBeAuthentified(), 
	inbox.getUnseenMessagesCount(),
	(request, response) => {
    user.getUserInfo(request, function(profile){
        response.render('user/editProfile', {
            global:getParameters(request),
            profile:profile
        })
    })
})
//profile - inbox
.get('/profile/inbox', 
	mustBeAuthentified(), 
	inbox.getUnseenMessagesCount(),
	(request, response) => {
    inbox.listAllMessages(request, function(messages){
        response.render('inbox/messagingBoard', {
            global:getParameters(request),
			otherScripts:[{script:"/js/inboxClient.js"}],
            messages:messages
        })
    })
})
//view message - inbox
.get('/profile/inbox/message/:id', 
	mustBeAuthentified(),
	inbox.isRelatedToMessage(),
	inbox.getUnseenMessagesCount(),
	(request, response) => {
    inbox.getMessage(request, function(result){
        response.render('inbox/viewMessage', {
            global:getParameters(request),
            message:result
        })
    })
})
//new message - inbox
.get('/profile/inbox/new',
	mustBeAuthentified(),
	inbox.getUnseenMessagesCount(),
	(request, response) => {
	response.render('inbox/newMessage', {
		global:getParameters(request)
	})
})


//view profile
.get('/user/:id', 
	user.getUserInfoByLogin(), 
	article.getAuthorPublications(), 
	shared.getAuthorPublications(),
	inbox.getUnseenMessagesCount(),
	(request, response) => {
    response.render('user/viewProfile', {
        global:getParameters(request),
        otherScripts:[{script:"/js/profileBlast.js"}],
        profile:request.profile,
        articles: request.articles,
        shareables: request.shareables
    })    
})


//connection/inscription
.get('/connect', (request, response) => {
    response.render('connect/connect', {
		global:getParameters(request)
	})
})
.post('/connect', (request, response, next) =>{
	passport.authenticate('local', function(err,user,info) {
		if(!user) {
			return response.redirect("/connect?error=1")
		} else {
			request.login(user, loginErr => {
				if (loginErr) {
					return next(loginErr);
				}
                console.log("ptp:api:(/connect):passport.authenticate:OK:():"+user.login+" (UA: "+request.headers['user-agent']+") (IP: "+request.connection.remoteAddress+")");

				var nexturl = request.session.nextUrl;
				delete request.session.nextUrl;
				response.redirect(nexturl || '/');
				return;
			}); 
		}
	})(request,response,next)
    /*successRedirect: '/',
    failureRedirect: '/connect?error=1'*/
})
.post('/subscribe',(request, response) => {
    connect.inscription(request, function(msg){
        response.render('connect/connect', {
            global:getParameters(request),
            special:msg
        })
    })
})
.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})


////////////////// articles
//view article
.get('/article/:id', 
	 (request, response) => {
    article.getArticle(request.params.id, function(result){
        response.render('article/showArticle', {
            global:getParameters(request),
            article:result,
			otherScripts:[{script:"/js/asyncVote.js"}],
        }) 
    })
})
//list articles
.get('/article',
	 (request, response) => {
    article.listArticles(config.limitDocuments.default, function(err, articles, count){ //0: no limit
        response.render('../views/layouts/listArticles', {
            global:getParameters(request),
            articles:articles,
            pageTitle:'Derniers articles',
            pagination:getPagination('/article/page',1,count, config.limitDocuments.default),
        })
    })
})
.get('/article/page/:n',
	 (request, response) => {
    article.listArticles(config.limitDocuments.default, function(err, articles, count){ //0: no limit
        response.render('../views/layouts/listArticles', {
            global:getParameters(request),
            articles:articles,
            pageTitle:'Derniers articles',
			pagination:getPagination('/article/page',parseInt(request.params.n),count, config.limitDocuments.default),
        })
    },(request.params.n-1) * config.limitDocuments.default)
})

//write article
.get('/new/article', 
	 mustBeAuthentified(), 
	 hasPrivilege(user.law.privileges.ARTICLE_POST),
	 (request, response) => {
    response.render('article/newArticle', {
        global:getParameters(request),
        apiCalled:'/api/add/article'
    })
})
//edit article
.get('/edit/article/:id', 
	 mustBeAuthentified(), 
	 hasPrivilege(user.law.privileges.EDIT_DOCUMENT), 
	 (request, response) => {
	article.getArticle(request.params.id, function(result){
		response.render('article/newArticle', {
			global:getParameters(request),
			apiCalled:'/api/edit/article',
			article:result
   		})
	},true) //edit mode
})
// comment
.post('/comment/article',
      mustBeAuthentified(),
      hasPrivilege(user.law.privileges.COMMENT_ARTICLE),
      (request,response) => {
    article.commentArticle(request, function(err, data) {
        if(err) {
            console.log(err);
        }
        response.redirect(data.redirect);
    });
})
//////////////// SHARED
//shared
.get('/shared/:id',
	 inbox.getUnseenMessagesCount(),
	 (request, response) => {
    shared.getShareable(request.params.id, function(result){
        response.render('shared/showShared', {
            global:getParameters(request),
            shareable:result,
			otherScripts:[{script:"/js/asyncVote.js"}],
        })  
    })
})    
//list shareables
.get('/shared', 
	 (request, response) => {
    shared.listShareables(config.limitDocuments.default, function(err, shareables, count) {
        response.render('shared/listShared', {
            global:getParameters(request),
            shareables:shareables,
            pagination:getPagination('/shared/page',1,count, config.limitDocuments.default),
        })    
    })
})
.get('/shared/page/:n', 
	 (request, response) => {
    shared.listShareables(config.limitDocuments.default, function(err, shareables, count) {
        response.render('shared/listShared', {
            global:getParameters(request),
            shareables:shareables,
            pagination:getPagination('/shared/page',parseInt(request.params.n),count, config.limitDocuments.default),
        })    
    }, (request.params.n-1) * config.limitDocuments.default)
})

//write & upload shared
.get('/new/shared',
	 mustBeAuthentified(), 
	 hasPrivilege(user.law.privileges.SHAREABLE_POST), 
	 (request, response) => {
    response.render('shared/newShared' , {
        global:getParameters(request),
		apiCalled:'/api/add/shareable'
    })
})

//edit shared
.get('/edit/shared/:id',
	 mustBeAuthentified(),
	 hasPrivilege(user.law.privileges.EDIT_DOCUMENT),
	 (request, response) => {
	shared.getShareable(request.params.id, function(result){
		response.render('shared/newShared' , {
			global:getParameters(request),
			apiCalled:'/api/edit/shareable',
			shareable:result
		})
	},true)//edit mode
})
// comment
.post('/comment/shared',
      mustBeAuthentified(),
      hasPrivilege(user.law.privileges.COMMENT_ARTICLE),
      (request,response) => {
    shared.commentShareable(request, function(err, data) {
        if(err) {
            console.log(err);
        }
        response.redirect(data.redirect);
    });
})
////////////// NEWS
//edit & view are on articles (news = article)
//list news
.get('/news', 
	 (request, response) => {
    article.listNews(config.limitDocuments.default, function(err,news, count){
        response.render('../views/layouts/listArticles', {
            global:getParameters(request),
            articles:news,
            pageTitle:'Dernières news',
			isnews:true,
            pagination:getPagination('/news/page',1,count, config.limitDocuments.default),
        })  
    })
})
.get('/news/page/:n', 
	 (request, response) => {
    article.listNews(config.limitDocuments.default, function(err,news, count){
        response.render('../views/layouts/listArticles', {
            global:getParameters(request),
            articles:news,
            pageTitle:'Dernières news',
			isnews:true,
			pagination:getPagination('/news/page',parseInt(request.params.n),count, config.limitDocuments.default),
        })  
    },(request.params.n-1) * config.limitDocuments.default)
})
//write news
.get('/new/news', 
	 mustBeAuthentified(), 
	 hasPrivilege(user.law.privileges.BO_ACCESS), 
	 (request, response) => {
    response.render('article/newArticle', {
        global:getParameters(request),
        apiCalled:'/api/add/news'
    })
})


//search
.get('/search',
     search.findNews(),         
     search.findArticles(),     
     search.findShareables(),   
     (request, response) => {
    response.render('search/search', {
        global:getParameters(request),
		otherScripts:[{script:"/js/searchClient.js"}],
        resultFound: {
            news : request.newsFound,
            articles : request.articlesFound,
            shareable : request.shareableFound
        }
    })
})

//BACK OFFICE
//menu
.get('/admin', 
	 hasPrivilege(user.law.privileges.BO_ACCESS), 
	 (request, response) => {
    response.render('backOffice/menu', {
		global:getParameters(request),
        otherScripts:[
            {script:'/js/chartsClient.js'},
            {script:'/js/Chart.min.js'},
        ],
        graphs: BO.buildGraphs(),
        forceGraphsData: true
	})
}) // getGraphsData(cb, true);
.post('/admin/forceGraphsData', 
    hasPrivilege(user.law.privileges.BO_ACCESS),
    (req, res) => {
    BO.getGraphsData((data) => {
        sendJSON(res, data);    
    }, true);
})
.post('/admin/graphsData', 
    hasPrivilege(user.law.privileges.BO_ACCESS),
    (req, res) => {
    BO.getGraphsData((data) => {
        sendJSON(res, data);    
    });
})
.get('/admin/users',
	 hasPrivilege(user.law.privileges.BO_ACCESS), 
	 (request, response) => {
    user.listUsers(config.limitDocuments.default,function(err, userList, count){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(userList, BO.UserTableModel),
            htmlAfter:BO.UserTableModel.addHtmlAfter,
			type:'users',
            pagination:getPagination('/admin/users/page',1, count, config.limitDocuments.default),
        })  
    })
})
.get('/admin/users/page/:n',
	 hasPrivilege(user.law.privileges.BO_ACCESS), 
	 (request, response) => {
    user.listUsers(config.limitDocuments.default,function(err, userList, count){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(userList, BO.UserTableModel),
            htmlAfter:BO.UserTableModel.addHtmlAfter,
			type:'users',
            pagination:getPagination('/admin/users/page',parseInt(request.params.n),count, config.limitDocuments.default),
        })  
    },(request.params.n-1) * config.limitDocuments.default)
})
.get('/admin/articles', 
	 hasPrivilege(user.law.privileges.BO_ACCESS),
	 (request, response) => {
    article.listArticles(config.limitDocuments.default, function(err, list, count){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(list, BO.ArticleTableModel),
			type:'articles',
            pagination:getPagination('/admin/articles/page',1,count, config.limitDocuments.default),
        })  
    })
})
.get('/admin/articles/page/:n', 
	 hasPrivilege(user.law.privileges.BO_ACCESS),
	 (request, response) => {
    article.listArticles(config.limitDocuments.default, function(err, list, count){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(list, BO.ArticleTableModel),
			type:'articles',
			pagination:getPagination('/admin/articles/page',parseInt(request.params.n),count, config.limitDocuments.default),
        })  
    },(request.params.n-1) * config.limitDocuments.default)
})
.get('/admin/news',
	 hasPrivilege(user.law.privileges.BO_ACCESS),
	 (request, response) => {
    article.listNews(config.limitDocuments.default, function(err, list, count){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(list, BO.NewsTableModel),
			type:'news',
            pagination:getPagination('/admin/news/page',1,count, config.limitDocuments.default),
        })  
    })
})
.get('/admin/news/page/:n',
	 hasPrivilege(user.law.privileges.BO_ACCESS),
	 (request, response) => {
    article.listNews(config.limitDocuments.default, function(err, list, count){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(list, BO.NewsTableModel),
			type:'news',
			pagination:getPagination('/admin/news/page',parseInt(request.params.n),count, config.limitDocuments.default),
        })  
    },(request.params.n-1) * config.limitDocuments.default)
})
.get('/admin/shareables',
	 hasPrivilege(user.law.privileges.BO_ACCESS),
	 (request, response) => {
    shared.listShareables(config.limitDocuments.default, function(err, list, count){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(list, BO.ShareableTableModel),
			type:'shareables',
            pagination:getPagination('/admin/shareables/page',1,count, config.limitDocuments.default),
        })  
    })
})
.get('/admin/shareables/page/:n',
	 hasPrivilege(user.law.privileges.BO_ACCESS),
	 (request, response) => {
    shared.listShareables(config.limitDocuments.default, function(err, list, count){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(list, BO.ShareableTableModel),
			type:'shareables',
			pagination:getPagination('/admin/shareables/page',parseInt(request.params.n),count, config.limitDocuments.default),
        })  
    },(request.params.n-1) * config.limitDocuments.default)
})

////////////////// APIs ////////////////////


//update user profile
.post('/api/update/profile', 
	  mustBeAuthentified(), 
	  (request, response) => {
    user.updateUserInfo(request, function(err){
        if(err){
            response.redirect('/profile/options?error=1');
        }else {
            response.redirect('/profile/options?success=1');
        }
    })
})

//update user password
.post('/api/update/password', 
	  mustBeAuthentified(), 
	  (request, response) => {
    user.updateUserPassword(request, function(err){
        if(err){
            response.redirect('/profile/options?error=1');
        }else {
            response.redirect('/profile/options?success=1');
        }
    })
})

//upload profile picture
.post('/api/photo', 
	  mustBeAuthentified(), 
	  (request,response) => {
    uploadImage(request,response,function(err) {
        if(err) {
            response.render('error', {
                errorCode:500,
                errorTitle:"Erreur d'upload",
                errorContent:err
            });
        }else{
            user.updateUserProfilePicture(request, function(err){
                if(!err){
                    response.redirect('/profile/options?success=1');
                }else{
                    response.redirect('/profile/options?error=1');
                }
            })
        }
    });
})

//send message - inbox
.post('/api/inbox/new',
	  mustBeAuthentified(), 
	  (request, response) => {
    inbox.sendMessage(request, function(err,result){
        if(result) {
			//response.redirect('/profile/inbox/message/'+result._id)
			response.redirect('/profile/inbox')
		} else {
			response.redirect('/profile/inbox?error=1')
		}
    })
})

//add article
.post('/api/add/article', 
	  mustBeAuthentified(),
	  hasPrivilege(user.law.privileges.ARTICLE_POST),
	  (request, response) => {
    article.addArticle(request, function(err,id){
        if(id) {
            response.redirect('/article/'+id);
        }
		if(err) {
			
		}
    })
})

//edit article
.post('/api/edit/article',
	  mustBeAuthentified(), 
	  hasPrivilege(user.law.privileges.EDIT_DOCUMENT),
	  (request, response) => {
    article.editDocument(request, function(err, id) {
		if(id) {
            response.redirect('/article/'+id);
        }
		if(err) {
			
		}
	})
})

//add news
.post('/api/add/news',
	  hasPrivilege(user.law.privileges.BO_ACCESS),
	  (request, response) => {
    article.addNews(request, function(err,id){
        if(id){
            response.redirect('/article/'+id);
        }
    })
})

//add shareable & upload document
.post('/api/add/shareable', 
	  hasPrivilege(user.law.privileges.SHAREABLE_POST), 
	  (request, response) => {
    uploadDocument(request,response,function(err) {
        if(err || !request.file) {
            response.render('error', {
                errorCode:500,
                errorTitle:"Erreur d'upload",
                errorContent:err
            });
        }else{
            shared.addShareable(request, function(err, id) {
                if(id){
                    response.redirect('/shared/'+id);
                }
            })
        }
    });
})

//edit shareable
.post('/api/edit/shareable',  
	  mustBeAuthentified(), 
	  hasPrivilege(user.law.privileges.EDIT_DOCUMENT), 
	  (request, response) => {
	shared.editShareable(request, function(err, id) {
		if(id) {
			response.redirect('/shared/'+id);
		}
		if(err) {
			
		}
	})
})

.post('/api/delete/user', 
	  hasPrivilege(user.law.privileges.BO_REMOVE_USER),
	  (request,response) => {
    BO.deleteUser(request, function(err){
        if(err){
            response.redirect('/admin/users?error=1');
            console.log("ptp:api:(/api/delete/user):BO.deleteUser:ERR:():"+err);
        }
        else response.redirect('/admin/users?succes=1');
    })
})
.post('/api/promote/user',
	  hasPrivilege(user.law.privileges.BO_PROMOTE_USER),
	  user.getUserInfoByLogin(), 
	  (request,response) => {
    BO.updateUserRank(request, function(err){
        if(err){
            response.redirect('/admin/users?error=2');
            console.log("ptp:api:(/api/promote/user):BO.updateUserRank:ERR:():"+err);
        }
        else response.redirect('/admin/users?succes=2');
    })
})
.post('/api/delete/article', 
	  hasPrivilege(user.law.privileges.BO_ACCESS),
	  (request,response) => {
    BO.deleteArticle(request, function(err){
        if(err){
            response.redirect('/admin/articles?error=1');
            console.log("ptp:api:(/api/delete/article):BO.deleteArticle:ERR:():"+err);
        }
        else response.redirect('/admin/articles?succes=1');
    })
})
.post('/api/delete/news', 
	  hasPrivilege(user.law.privileges.BO_ACCESS), 
	  (request,response) => {
    BO.deleteArticle(request, function(err){
        if(err){
            response.redirect('/admin/news?error=1');
            console.log("ptp:api:(/api/delete/news):BO.deleteArticle:ERR:():"+err);
        }
        else response.redirect('/admin/news?succes=1');
    })
})
.post('/api/delete/shareables',
	  hasPrivilege(user.law.privileges.BO_ACCESS),
	  (request,response) => {
    BO.deleteShareable(request, function(err){
        if(err){
            response.redirect('/admin/shareables?error=1');
            console.log("ptp:api:(/api/delete/shareables):BO.deleteShareable:ERR:():"+err);
        }
        else response.redirect('/admin/shareables?succes=1');
    })
})

// upvote/downvote for an article
.post('/api/vote/article',
	 mustBeAuthentified(),
	 (request, response) => {
	article.vote(request, (result) => {
		if(result.err) {
			console.log(result.err);
		}
		sendJSON(response, result);
	});
})

// upvote/downvote for a share
.post('/api/vote/shared',
	 mustBeAuthentified(),
	 (request, response) => {
	shared.vote(request, (result) => {
		if(result.err) {
			console.log(result.err);
		}
		sendJSON(response, result);
	});
})

//////////////////////////
.get('/forbidden', function(req,res){
    res.render('error',{
        errorCode:403,
        errorTitle:"Restricted area. Keep out !"
    });
})

//////////  OTHER ROUTES ///////
.get('*', function(req, res){
  res.render('error',{
      errorCode:404,
      errorTitle:"Page non trouvée",
      errorContent:"Essayez ailleur !"
  });
});



//////////// Error handler //////////
app.use((err, request, response, next) => {  
  console.log("ptp:app:():():ERR:(Express error handler):"+err);
  response.status(500).render('error', {
      errorCode:500,
      errorTitle:"Erreur de serveur interne",
      errorContent:err
	  //EBADCSRFTOKEN
  });
});


//application launch
server.listen(port, (err) => {
    if(err) {
        return console.log("ptp:app:():():ERR:(Node launch error):", err)
    }
    console.log(`ptp:app:(/):():OK:(main server listening *:${port})`);
    console.log(`SessionID : ${sessionID}`);
    
});



//////////// midlewares functions //////////
/**
verify user is connected
if not, redirect to /connect
*/
function setIsNextUrl(req,res){
	var nextUrl = req.originalUrl;
		
	var notRedirectedUrl = [
		"/profile/options",
		"/connect",
		"/"
	]
	if(notRedirectedUrl.indexOf(nextUrl) == -1){
		req.session.nextUrl = nextUrl;
	}
	res.redirect('/connect');
}

function mustBeAuthentified() {
    return function (req, res, next) {
        if(req.isAuthenticated()) {
            return next()
        }
		
		setIsNextUrl(req,res);
    }
}

function hasPrivilege(priv){
    return function (req, res, next) {
        user.getUserInfo(req, function(profile){
            if(profile){
                for(var i=0; i<profile.privileges.length; i++){
                    if(profile.privileges[i].privilege === priv){
                        return next();
                    }
                }
            }
			//no enough rights
			
            //res.redirect('/forbidden');
            setIsNextUrl(req,res);
        })
    }
}
//generate a key from a login
function getKeyFromLogin(login){
	
	if(login != null) 
		return md5(login+config.chat.secret+sessionID);
	return "invalid";
}

function getPagination(url, currentPage, documentCount, offset) {
    let pageMax = Math.floor(documentCount/offset) + 1;
    let pagination =  {
        url: url,
        beforepages: [],
        current: currentPage,
        afterpages: [],
    };
    if(currentPage > 1) {
        pagination.firstpage=1;
        pagination.previous=currentPage-1;
    }
    for(let b = currentPage-1; b>currentPage-5 && b>0; b--) {
        pagination.beforepages.unshift(b);
    }
    for(let a = currentPage+1; a<currentPage+5 && a<=pageMax; a++) {
        pagination.afterpages.push(a);
    }
    if(currentPage < pageMax) {
        pagination.lastpage=pageMax;
        pagination.next=currentPage+1;
    }
    return pagination;
}

/**
global parameters
accessing global : global.*
accessing 'get' parameters : 'global.query.*'
*/
function getParameters(request){
    return {
		query:request.query,
		csrfToken:request.csrfToken(),
        authentified:request.isAuthenticated(),
        userName:request.isAuthenticated()?request.user.login:null,
		unseenMessages:request.unseenMessages,
		privileges:request.privileges
    }
}

/**
 * send a JSON to response header
 * @param  {[Object]} response
 * @param  {[Object]} json
 */
function sendJSON(response, json) {
	response.contentType('application/json');
	response.send(JSON.stringify(json, null, 4));
}

/**
CSRF token

*/
var csrfTokens = [];

function csrf() {
	return function (req, res, next) {
		
		//add csrftoken generation to request
		req.csrfToken = function(){
			var token = md5(config.session.secret+Math.random());
			if(csrfTokens.length > config.session.csrfMaxTokens){
				csrfTokens.shift();
			}
			csrfTokens.push({value:token,date:new Date()});
			// console.log(token)
			return token;
		}
		
		//désactivé pour le moment !
		return next(); 
		
		//if POST request, verify csrf token
		/**
		
		if(req.method === 'POST' && req.headers['content-type'].indexOf("multipart/form-data")==-1) {
			var requestToken = req.body._csrf;
			//console.log("requested token : "+requestToken)
			//console.log("table:"+JSON.stringify(csrfTokens))
			//search token
			var tokenIndex = csrfTokens.findIndex((t)=>{return t.value==requestToken});
			if(tokenIndex != -1){
				var token = csrfTokens[tokenIndex];
				//delete token for good
				csrfTokens.splice(tokenIndex,1);
				//verify timestamp
				if(new Date() - token.date < config.session.csrfTimeExpire){
					//console.log('tokens:'+JSON.stringify(csrfTokens));
					return next();	
				} else {
					//console.log("token expired")
				}
			}
			//console.log("token not found")
			res.redirect('/forbidden');
		} else {
			return next();
		}
		
		*/
	}
}




