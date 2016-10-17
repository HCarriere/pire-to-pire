// index.js


const express = require('express')
const app = express()
const path = require('path')
const port = 3000
const exphbs = require('express-handlebars')
const passport = require('passport')
const session = require('express-session')
var bodyParser = require('body-parser')
//conf
const config = require('./config')


//application launch
app.listen(port, (err) => {
    if(err) {
        return console.log('Erreur inattendue', err)
    }
    console.log(`server listening ${port}`)
});


//Configuration d'express
app
.use(express.static(__dirname + '/views/assets'))//styles
.use( session({
    secret : config.session.secret,
    resave: false,
    saveUninitialized: false
}))
.use(passport.initialize())
.use(passport.session())
.use(bodyParser.json() )        // to support JSON-encoded bodies
.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))

//handlebars
app.engine('.hbs',exphbs({
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname,'views/layouts')
}));
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'app'))

//// inits ////
//indexes
var connect = require('./app/connect')
var article = require('./app/article')
connect.init()

////////////////////////
//    R O U T E S     //
////////////////////////
app
//home
.get('/', (request, response) => {
    response.render('home/home',{global:getParameters(request)})
})

//profil
.get('/profile', authenticationMiddleware(), (request, response) => {
    response.render('user/user', {global:getParameters(request)})
})

//connection/inscription
.get('/connect', (request, response) => {
    response.render('connect/connect', {global:getParameters(request)})
})
.post('/connect', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/connect?error=1'
}))
.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})
.post('/inscription',(request, response) => {
    connect.inscription(request, function(msg){
        response.render('connect/connect', {
            global:getParameters(request),
            special:msg
        })
    })
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
.post('/add/article', (request, response) => {
    article.addArticle(request, function(err,shortName){
        if(shortName){
            response.redirect('/article/'+shortName);
        }
        if(err){
             response.status(500).render('error', {
              errorCode:666,
              errorTitle:"Mais ques'ta fait toi...",
              errorContent:"Refait plus jamais ça."
          });
        }
    })
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

//other routes handler
app.get('*', function(req, res){
  res.render('error',{
      errorCode:404,
      errorTitle:"Page non trouvée",
      errorContent:"Essayez ailleur !"
  });
});

//Error handler
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


// midlewares functions
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


//global parameters
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



