// index.js


const express = require('express')
const path = require('path')
const app = express()
const port = 3000
const exphbs = require('express-handlebars')







//application launch
app.listen(port, (err) => {
    if(err) {
        return console.log('Erreur inattendue', err)
    }
    console.log(`server listening ${port}`)
});

//Error handler
app.use((err, request, response, next) => {  
  //TODO log error
  console.log(err);
  response.status(500).send('Something broke!');
  response.status(404).send('Not found.');
});

//styles
app.use(express.static(__dirname + '/views/assets'));

//handlebars
app.engine('.hbs',exphbs({
    
    defaultLayout: 'main',
    extname: '.hbs',
    layoutsDir: path.join(__dirname,'views/layouts')
}));
app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'app'))



////////////////////////
//    R O U T E S     //
////////////////////////
app
.get('/', (request, response) => {
    response.render('home/home',{})
})
.get('/profile', (request, response) => {
    response.render('user/user', {})
})
.get('/article/:id', (request, response) => {
    response.render('article/article', {})
})
.get('/search', (request, response) => {
    response.render('search/search', {})
})
.get('/shared/:id', (request, response) => {
    response.render('shared/shared', {})
})    



//var userBase = require('./app/user/schema')
//var mongo = require('./app/mongo')
//.get('/c', (request, response) => {
//    mongo.open();
//    
//    var object = new userBase.Model({
//        login:'Bob',
//        password:'123',
//        name:'namename',
//        privileges:['a','b'],
//        rank:'admin'
//    });
//    mongo.add(object);
//
//    mongo.close();
//    response.send('create');
//})
//.get('/r', (request, response) => {
//    mongo.open();
//    
//    mongo.find(userBase.Model,{
//        login:'Bob'
//    });
//
//    mongo.close();
//    response.send('read');
//})
//.get('/u', (request, response) => {
//    mongo.open();
//    
//    mongo.update(userBase.Model,
//        {
//        login:'Bob',
//        },{
//        password:'Alice'
//        }
//    ,null);
//
//    mongo.close();
//    response.send('update');
//})
//.get('/d', (request, response) => {
//    mongo.open();
//    
//    mongo.remove(userBase.Model,
//    {
//        login:'Bob'
//    });
//
//    mongo.close();
//    response.send('remove');
//});
//

//app.get('/projects/:id', (req, res) => {
//  req.param.id;
//})

