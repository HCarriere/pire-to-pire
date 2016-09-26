// index.js

const path = require('path')
const express = require('express')
var Vue = require('vue')

const app = express()
const port = 3000


//routes
app.get('/', (request, response) => {
    response.send('Welcome.')
    throw new Error('error!')
})

app.post('/users', function(req,res) {
    //retrieve users
    const user = req.body
    users.push({
        name: user.name,
        age: user.age
    })
    res.send('successfully registered')
})



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

