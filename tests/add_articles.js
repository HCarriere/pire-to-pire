const mongo = require('../app/mongo')
const ArticleSchema = require('../app/article').Schema



function init(){
    var dataArray = [{
        name: "Tortues Ninja",
        shortName: "tortues-ninja",
        content: "Cet article parle des tortues ninja.",
        publicationDate:new Date(),
        tags:[
            {tag:"tortues ninja"},
            {tag:"atari"},
            {tag:"retro"}
        ],
        author:"user2"
    }, 
              {
        name: "Tintin au tibet",
        shortName: "tintin-au-tibet",
        content: "Tintin au tibet, bah c'était dur !",
        publicationDate:new Date(),
        tags:[
            {tag:"tintin"},
            {tag:"hergé"},
            {tag:"retro"}
        ],
        author:"user2"
    }, 
              {
        name: "No man's sky",
        shortName: "no-mans-sky",
        content: "Whoa, quelle arnaque !",
        publicationDate:new Date(),
        tags:[
            {tag:"exploration"},
            {tag:"espace"},
            {tag:"arnaque"}
        ],
        author:"user2"
    }, 
              {
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
    },
              {
        name: "Tamagochi",
        shortName: "tamagochi",
        content: "Laissez moi vous compter l'histoire des tamagochi...",
        publicationDate:new Date(),
        tags:[
            {tag:"japon"},
            {tag:"sommeil"},
            {tag:"arnaque"}
        ],
        author:"user1"
    }]
    
    mongo.processFunction(mongo.add, ArticleSchema, dataArray, 0, function(){
        process.exit();
    })
}

init();
