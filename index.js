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
    failureRedirect: '/connect'
}))
.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
})
.post('/inscription',(request, response) => {
    response.render('connect/connect', {
        global:getParameters(request),
        special:connect.inscription(request)
    })
})


//articles
.get('/article/:id', (request, response) => {
    response.render('article/article', {global:getParameters(request)})
})
.get('/article', (request, response) => {
    response.render('article/lastArticles', {global:getParameters(request)})
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




//Error handler
app.use((err, request, response, next) => {  
  //TODO log error
  console.log(err);
  response.status(500).send('Error 500 : '+err.message);
  response.status(404).send('Error 404 : '+err);
});


// midlewares functions

function authenticationMiddleware() {
    return function (req, res, next) {
        if(req.isAuthenticated()) {
            return next()
        }
        res.redirect('/connect')
    }
}


//global parameters

function getParameters(request){
    return {
        logName:request.isAuthenticated()?request.user.login:null
    }
}



