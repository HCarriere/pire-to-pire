const ArticleModel = require('./index').Model
const mongo = require('../mongo')







function getArticles(callback){
    mongo.find(ArticleModel, {}, function(err,result){
        if(err){
            callback(err, null)
        }
        else if(result){
            callback(err,result)
        }
        else callback(null,null)
    })
    
}

module.exports = {
    getArticles
}


/*

{
        article : [
            {
                shortName:"short-name",
                title:"Comment j'ai réussi à echapper aux trolls",
                extract:" lorem ipsum et caetera",
                author:"herv",
                publicationDate:"15/10/2017",
                tags:[
                    {
                        tag:"youpi"
                    },
                    {
                        tag:"test"
                    },
                    {
                        tag:"lol"
                    }
                ]
            },
            {
                shortName:"short-name2",
                title:"If you want to kill a troll... You name it.",
                extract:" lorem ipsum et caetera2",
                author:"herv2",
                publicationDate:"15/10/2018",
                tags:[
                    {
                        tag:"youpi2"
                    },
                    {
                        tag:"test1"
                    },
                    {
                        tag:"lol5"
                    }
                ]
            }
        ]
    }

*/