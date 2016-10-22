// server.js

//imports
const express   = require('express')
const path      = require('path')
const exphbs    = require('express-handlebars')
const passport  = require('passport')
const session   = require('express-session')
const bodyParser= require('body-parser')
const multer    = require('multer');

//General cong
const config    = require('./config') //config file
const app       = express()
const port      = config.server.port


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


//handlebars configuration
app.
engine('.hbs',exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname,'views/layouts')
}))
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

/////////// inits ///////////
connect.init()


////////////////////////
//    R O U T E S     //
////////////////////////
app
////////// FRONT //////////

//home
.get('/', (request, response) => {
    response.render('home/home',{global:getParameters(request)})
})

//profil
.get('/profile', authenticationMiddleware(), (request, response) => {
    user.getUserInfo(request, function(profile){
        response.render('user/profile', {
            global:getParameters(request),
            profile:profile
        })
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
.get('/article/:id', (request, response) => {
    response.render('article/showArticle', {global:getParameters(request)})
})
.get('/article', (request, response) => {
    article.getArticles(function(err, articles){
       response.render('article/lastArticles', {
            global:getParameters(request),
            articles:articles
        }) 
    })
})
.get('/new/article', (request, response) => {
    response.render('article/newArticle', {global:getParameters(request)})
})



//search
.get('/search', (request, response) => {
    response.render('search/search', {global:getParameters(request)})
})

//shared
.get('/shared/:id', (request, response) => {
    response.render('shared/shared', {global:getParameters(request)})
})    
.get('/shared', (request, response) => {
    response.render('shared/lastShared', {global:getParameters(request)})
})


////////////////// API ////////////////////


//update user profile
.post('/api/update/profile', authenticationMiddleware(), (request, response) => {
    user.updateUserInfo(request, function(err){
        if(err){
            response.redirect('/profile?error=1');
        }else {
            response.redirect('/profile?success=1');
        }
    })
})

//add article
.post('/api/add/article', (request, response) => {
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

//upload profile picture
.post('/api/photo',function(request,response){
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



;
//////////  OTHER ROUTES ///////
app.get('*', function(req, res){
  res.render('error',{
      errorCode:404,
      errorTitle:"Page non trouvée",
      errorContent:"Essayez ailleur !"
  });
});



//////////// Error handler //////////
app.use((err, request, response, next) => {  
  //TODO log error
  console.log('Erreur reçue : ' +err);
  response.status(500).render('error', {
      errorCode:405,
      errorTitle:"Erreur de serveur interne",
      errorContent:err
  });
  //response.status(404).send('Error 404 : '+err);
});


//application launch
app.listen(port, (err) => {
    if(err) {
        return console.log('Erreur inattendue', err)
    }
    console.log(`server listening ${port}`)
});



//////////// midlewares functions //////////
/**
verify user is connected
if not, redirect to /connect
*/
function authenticationMiddleware() {
    return function (req, res, next) {
        if(req.isAuthenticated()) {
            return next()
        }
        res.redirect('/connect')
    }
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



