const article = require('../article')
const shared = require('../shared')


////////////////// private ////////////////



////////////////// public ///////////////
//middleware1
function getHomeLastNews(){
    return function (request, response, next) {
		article.listNews(1, function(err,result){
            if(result){
                request.news = result;
            }
            return next();
        })
    }
}

//middleware 2
function getHomeArticles(){
    return function (request, response, next) {
        article.listArticles(1, function(err,result){
            if(result){
                request.articles = result;
            }
            return next();
        })
    }
}

//middleware 3
function getHomeShareables(){
    return function (request, response, next) {
        shared.listShareables(1,function(err,result){
            if(result) {
                request.shareables = result;
            }
            return next();
        })
    }
}



module.exports = {
    getHomeLastNews,
    getHomeArticles,
    getHomeShareables
}