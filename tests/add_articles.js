const mongo = require('../app/mongo')
const ArticleSchema = require('../app/article').Schema

//mongo.add({"name":"Tortues Ninja", "shortName":"tortues-ninja","content":"Cet article parle des tortues ninja.","publicationDate":Date(), "tags" : [{"tag":"tortues ninja"},{"tag":"atari"},{"tag":"retro"}],"author":"admin1"})


function init(){
    mongo.add({
        name: "Tortues Ninja",
        shortName: "tortues-ninja",
        content: "Cet article parle des tortues ninja.",
        publicationDate:new Date(),
        tags:[
            {tag:"tortues ninja"},
            {tag:"atari"},
            {tag:"retro"}
        ],
        author:"admin1"
    }, ArticleSchema, function(err){
        if(err){
            console.log("insertion OK")
        }else{
            console.log(err)
        }
    })

    mongo.add({
        name: "Tintin au tibet",
        shortName: "tintin-au-tibet",
        content: "Tintin au tibet, bah c'était dur !",
        publicationDate:new Date(),
        tags:[
            {tag:"tintin"},
            {tag:"hergé"},
            {tag:"retro"}
        ],
        author:"admin1"
    }, ArticleSchema, function(err){
        if(err){
            console.log("insertion OK")
        }else{
            console.log(err)
        }
    })
    mongo.add({
        name: "No man's sky",
        shortName: "no-mans-sky",
        content: "Whoa, quelle arnaque !",
        publicationDate:new Date(),
        tags:[
            {tag:"exploration"},
            {tag:"espace"},
            {tag:"arnaque"}
        ],
        author:"admin1"
    }, ArticleSchema, function(err){
        if(err){
            console.log("insertion OK")
        }else{
            console.log(err)
        }
    })
    
    mongo.add({
        name: "League of Legend",
        shortName: "lol",
        content: "Tu pleure?",
        publicationDate:new Date(),
        tags:[
            {tag:"sel"},
            {tag:"calisse"},
            {tag:"arnaque"}
        ],
        author:"user1"
    }, ArticleSchema, function(err){
        if(err){
            console.log("insertion OK")
        }else{
            console.log(err)
        }
    })
}

init();