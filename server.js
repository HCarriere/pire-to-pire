// server.js

//imports
const express   = require('express')
const path      = require('path')
const exphbs    = require('express-handlebars')
const passport  = require('passport')
const session   = require('express-session')
const bodyParser= require('body-parser')
const multer    = require('multer')
const http		= require('http')

//General cong
const mongo     = require('./app/mongo')
const config    = require('./config') //config file
const app       = express();
const port      = process.env.PORT || config.server.port;
const server 	= http.createServer(app);

//Express configuration
app
.use(express.static(__dirname + '/views/assets'))   //styles
.use(express.static(__dirname + '/uploads'))        //uploads
.use(session({
    secret : config.session.secret,
    resave: false,
    saveUninitialized: false
}))
.use(passport.initialize())
.use(passport.session())
.use(bodyParser.json() )        // to support JSON-encoded bodies
.use(bodyParser.urlencoded({    // to support URL-encoded bodies
  extended: true
}))



var handlebars = exphbs.create({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname,'views/layouts'),
    helpers: {
        ifContains: function(context, options, out) { //{{#ifContains privileges 'create_articles'}} interieur {{/ifContains}}
            if(!context){
                return "";
            }
            for(i=0; i<context.length; i++){
                if(context[i].privilege === options){
                    //contains
                    return out.fn(this);
                }
            }
        }
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




/////////// indexes ///////////
var connect = require('./app/connect')
var article = require('./app/article')
var user    = require('./app/user')
var home    = require('./app/home')
var search  = require('./app/search')
var BO      = require('./app/backOffice')
var chat 	= require('./app/chat')


/////////// inits ///////////
connect.init();
chat.init(server);
mongo.initMongo();
////////////////////////
//    R O U T E S     //
////////////////////////
app
////////// FRONT //////////

//home

.get('/',home.getHomeLastNews(), home.getHomeArticles(), home.getHomeShareables(), chat.fetchPreviousChatMessages(config.chat.limitPrevious),user.getUserPrivileges(), (request, response) => {
    response.render('home/home',{
        global:getParameters(request),
		otherScripts:[{script:"/socket.io/socket.io.js"},
					  {script:"/js/chatClient.js"}],
		previousChatMessage: request.previousChatMessage,
		keyAuth: getKeyFromPseudo(request.userPseudo),
        articles : request.articles,
		userPseudo : request.userPseudo,
        privileges:request.privileges,
		news: request.news
    })
})
//edit profile
.get('/profile', mustBeAuthentified(), (request, response) => {
    user.getUserInfo(request, function(profile){
        response.render('user/editProfile', {
            global:getParameters(request),
            profile:profile
        })
    })
})

//view profile
.get('/user/:id',user.getUserInfoByPseudo(), article.getAuthorPublications() ,(request, response) => {
    response.render('user/viewProfile', {
        global:getParameters(request),
        profile:request.profile,
        articles: request.articles
//        news: request.news,
//        shareables: request.shareables
    })    
})


//connection/inscription
.get('/connect', (request, response) => {
    response.render('connect/connect', {global:getParameters(request)})
})
.post('/connect', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/connect?error=1'
}))
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


//articles
//view article
.get('/article/:id', (request, response) => {
    article.getArticle(request.params.id, function(result){
        response.render('article/showArticle', {
            global:getParameters(request),
            article:result
        }) 
    })
})
//list articles
.get('/article',user.getUserPrivileges() ,(request, response) => {
    article.listArticles(0, function(err, articles){ //0: no limit
        response.render('../views/layouts/listArticles', {
            global:getParameters(request),
            articles:articles,
            privileges:request.privileges,
            pageTitle:'Derniers articles'
        })
    })
})
//write article
.get('/new/article', mustBeAuthentified(), hasPrivilege(user.law.privileges.ARTICLE_POST), (request, response) => {
    response.render('article/newArticle', {
        global:getParameters(request),
        apiAdd:'/api/add/article'
    })
})


//shared
.get('/shared/:id', (request, response) => {
    response.render('shared/shared', {global:getParameters(request)})
})    
//list shareables
.get('/shared', (request, response) => {
    response.render('shared/lastShared', {global:getParameters(request)})
})
    
//list news
.get('/news', (request, response) => {
    article.listNews(0, function(err,news){
        response.render('../views/layouts/listArticles', {
            global:getParameters(request),
            articles:news,
            pageTitle:'Dernières news'
        })  
    })
})
//write news
.get('/new/news', mustBeAuthentified(), hasPrivilege(user.law.privileges.BO_ACCESS), (request, response) => {
    response.render('article/newArticle', {
        global:getParameters(request),
        apiAdd:'/api/add/news'
    })
})


//search
.get('/search',
    search.findNews(),         //middleware1 
    search.findArticles(),     //middleware2
    search.findShareables(),   //middleware3
    (request, response) => {
    response.render('search/search', {
        global:getParameters(request),
        resultFound: {
            news : request.newsFound,
            articles : request.articlesFound,
            shareable : request.shareableFound
        }
    })
})

//BACK OFFICE
//menu
.get('/admin', hasPrivilege(user.law.privileges.BO_ACCESS), (request, response) => {
    response.render('backOffice/menu', {global:getParameters(request)})
})
.get('/admin/users',hasPrivilege(user.law.privileges.BO_ACCESS), (request, response) => {
    user.listUsers(function(userList){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(userList, BO.UserTableModel)
        })  
    })
})
.get('/admin/articles',hasPrivilege(user.law.privileges.BO_ACCESS), (request, response) => {
    article.listArticles(0, function(err, list){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(list, BO.ArticleTableModel)
        })  
    })
})
.get('/admin/news',hasPrivilege(user.law.privileges.BO_ACCESS), (request, response) => {
    article.listNews(0, function(err, list){
        response.render('backOffice/table', {
            global:getParameters(request),
            admin:BO.getAsTable(list, BO.NewsTableModel)
        })  
    })
})


////////////////// APIs ////////////////////


//update user profile
.post('/api/update/profile', mustBeAuthentified(), (request, response) => {
    user.updateUserInfo(request, function(err){
        if(err){
            response.redirect('/profile?error=1');
        }else {
            response.redirect('/profile?success=1');
        }
    })
})

//update user password
.post('/api/update/password', mustBeAuthentified(), (request, response) => {
    user.updateUserPassword(request, function(err){
        if(err){
            response.redirect('/profile?error=1');
        }else {
            response.redirect('/profile?success=1');
        }
    })
})

//upload profile picture
.post('/api/photo', mustBeAuthentified(), (request,response) => {
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
                    response.redirect('/profile?success=1');
                }else{
                    response.redirect('/profile?error=1');
                }
            })
        }
    });
})

//add article
.post('/api/add/article', mustBeAuthentified(), hasPrivilege(user.law.privileges.ARTICLE_POST),(request, response) => {
    article.addArticle(request, function(err,shortName){
        if(shortName){
            response.redirect('/article/'+shortName);
        }
        if(err){
             response.render('error', {
              errorCode:666,
              errorTitle:"Mais qu'est ce que t'a fait toi...",
              errorContent:"Refait plus jamais ça."
          });
        }
    })
})

//add news
.post('/api/add/news', hasPrivilege(user.law.privileges.BO_ACCESS),(request, response) => {
    article.addNews(request, function(err,shortName){
        if(shortName){
            response.redirect('/article/'+shortName);
        }
    })
})

.post('/api/delete/user', hasPrivilege(user.law.privileges.BO_REMOVE_USER),(request,response) => {
    BO.deleteUser(request, function(err){
        if(err){
            response.redirect('/admin/users?error=1');
            console.log("ptp:api:(/api/delete/user):BO.deleteUser:ERR:():"+err);
        }
        else response.redirect('/admin/users?succes=1');
    })
})
.post('/api/update/user',hasPrivilege(user.law.privileges.BO_REMOVE_USER), (request,response) => {
    BO.updateUserRank(request, function(err){
        if(err){
            response.redirect('/admin/users?error=2');
            console.log("ptp:api:(/api/udpate/user):BO.updateUserRank:ERR:():"+err);
        }
        else response.redirect('/admin/users?succes=2');
    })
})
.post('/api/delete/article', hasPrivilege(user.law.privileges.BO_ACCESS),(request,response) => {
    BO.deleteArticle(request, function(err){
        if(err){
            response.redirect('/admin/articles?error=1');
            console.log("ptp:api:(/api/delete/article):BO.deleteArticle:ERR:():"+err);
        }
        else response.redirect('/admin/articles?succes=1');
    })
})
.post('/api/delete/news', hasPrivilege(user.law.privileges.BO_ACCESS), (request,response) => {
    BO.deleteArticle(request, function(err){
        if(err){
            response.redirect('/admin/news?error=1');
            console.log("ptp:api:(/api/delete/news):BO.deleteArticle:ERR:():"+err);
        }
        else response.redirect('/admin/news?succes=1');
    })
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
  //TODO log error
  console.log("ptp:app:():():ERR:(Express error handler):"+err);
  response.status(500).render('error', {
      errorCode:500,
      errorTitle:"Erreur de serveur interne",
      errorContent:err
  });
});


//application launch
server.listen(port, (err) => {
    if(err) {
        return console.log("ptp:app:():():ERR:(Node launch error):", err)
    }
    console.log(`ptp:app:(/):():OK:(main server listening *:${port})`)
    
});



//////////// midlewares functions //////////
/**
verify user is connected
if not, redirect to /connect
*/
function mustBeAuthentified() {
    return function (req, res, next) {
        if(req.isAuthenticated()) {
            return next()
        }
        res.redirect('/connect')
    }
}

function hasPrivilege(priv){
    return function (req, res, next) {
        user.getUserInfo(req, function(profile){
            if(profile){
                for(i=0; i<profile.privileges.length; i++){
                    if(profile.privileges[i].privilege === priv){
                        return next();
                    }
                }
            }
            res.redirect('/forbidden');
        })
    }
}

function getKeyFromPseudo(pseudo){
	var md5 = require('md5');
	if(pseudo != null) 
		return md5(pseudo+config.chat.secret);
	return "invalid";
}

//////////// global parameters ////////// 
/**
accession global : global.*
accessing 'get' parameters : 'global.query.*'
*/
function getParameters(request){
    return {
        authentified:request.isAuthenticated(),
        userName:request.isAuthenticated()?request.user.login:null,
        query:request.query
    }
}



