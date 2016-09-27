// index.js


const express = require('express')
var Vue = require('vue')

const app = express()
const port = 3000



//application launch
app.listen(port, (err) => {
    if(err) {
        return console.log('Erreur inattendue', err)
    }
    console.log(`server listening ${port}`)
})

//Error handler
app.use((err, request, response, next) => {  
  //TODO log error
  console.log(err)
  response.status(500).send('Something broke!')
})


//route home
app.get('/', (request, response) => {
    response.send('coucou.');
})




var userBase = require('./app/user/schema')
var mongo = require('./app/mongo')

app.get('/c', (request, response) => {
    mongo.open();
    
    var object = new userBase.Model({
        login:'Bob',
        password:'123',
        name:'namename',
        privileges:['a','b'],
        rank:'admin'
    });
    mongo.add(object);

    mongo.close();
    response.send('create')
})

app.get('/r', (request, response) => {
    mongo.open();
    
    mongo.find(userBase.Model,{
        login:'Bob'
    });

    mongo.close();
    response.send('read')
})

app.get('/u', (request, response) => {
    mongo.open();
    
    mongo.update(userBase.Model,
        {
        login:'Bob',
        },{
        password:'Alice'
        }
    ,null);

    mongo.close();
    response.send('update')
})

app.get('/d', (request, response) => {
    mongo.open();
    
    mongo.remove(userBase.Model,
    {
        login:'Bob'
    });

    mongo.close();
    response.send('remove')
})


//app.get('/projects/:id', (req, res) => {
//  req.param.id;
//})

