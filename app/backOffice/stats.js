'use strict';

const mongo = require('../mongo');
const article = require('../article');
const shared = require('../shared');

let resultCacheData;
let lastCalculationDate;
/*
- Article number per month this year: bars
- Article number per day of the month : bars
- Most used tag by month : bars
- Most used tags of all time : pie
// - Site visit frequency (per user type): lines

id: 'article_per_day',
datasets:[
    {
        label:'coucou mdr',
        data: [1, 3, 5, 4, 2, 1, 8],
    }
]
*/
// stats: {year, days, ever}
let statsBuilder = {
    articlesPerYear : function(info, stats, callback) {
        let thisYear = new Date();
        let year = stats.year[thisYear.getUTCFullYear()];
        
        let articlePerYear = [];
        let sharedPerYear = [];
        
        for(let m = 0; m<12; m++) {
            if(year[m]) {
                articlePerYear.push(year[m].articles);
                sharedPerYear.push(year[m].shared);
            } else {
                articlePerYear.push(0);
                sharedPerYear.push(0);
            }
        }
        
        let object = {
            id: info.id,
            type: info.type,
            datasets: [
                {
                    label: 'Articles',
                    data: articlePerYear,
                },
                {
                    label: 'Partages',
                    data: sharedPerYear,
                }
            ],
        }
        callback(object);
    },
    articlesPerDayOfMonth : function(info, stats, callback) {
        let articlePerDay = [];
        let sharedPerDay = [];
        
        for(let d=0; d<7; d++) {
            if(stats.days[d]) {
                articlePerDay.push(stats.days[d].articles);
                sharedPerDay.push(stats.days[d].shared);
            } else {
                articlePerDay.push(0);
                sharedPerDay.push(0);
            }
        }
        
        let object = {
            id: info.id,
            type: info.type,
            datasets: [
                {
                    label: 'Articles',
                    data: articlePerDay,
                },
                {
                    label: 'Partages',
                    data: sharedPerDay,
                }
            ],
        }
        callback(object);
    },
    mostUsedTagsPerYear : function(info, stats, callback) {
        let datasets = []; // label, data[]
        let usedTagsThisYear = [];
        let mostUsedTagsThisYear = [];
        let thisYear = new Date();
        let year = stats.year[thisYear.getUTCFullYear()];
        
        for(let m = 0; m<12; m++) {
            if(year[m]) {
                for(let t in year[m].tags) {
                    if(year[m].tags.hasOwnProperty(t)) {
                        if(!usedTagsThisYear[t]) {
                            usedTagsThisYear[t] = 0;
                        }
                        usedTagsThisYear[t]+=year[m].tags[t];
                    }
                }
            }
        }
        for(let t in usedTagsThisYear) {
            if(usedTagsThisYear.hasOwnProperty(t)) {
                mostUsedTagsThisYear.push({tag:t, number:usedTagsThisYear[t]});
            }
        }
        mostUsedTagsThisYear.sort(function(a, b){return b.number - a.number;});
        
        for(let i = 0; i<8; i++) {
            let tag = mostUsedTagsThisYear[i].tag;
            let data = [];
            for(let m = 0; m<12; m++) {
                if(year[m] && year[m].tags[tag]) {
                    data.push(year[m].tags[tag]);
                } else {
                    data.push(0);
                }
            }
            datasets.push({
                label: tag,
                data: data,
            })
        }
        
        let object = {
            id: info.id,
            type: info.type,
            datasets: datasets,
        };
        
        callback(object);
    },
    mostUsedTagsEver : function(info, stats, callback) {
        let tagsDesc = [];
        let tagsDescNumber = [];
        let tags = [];
        
        
        for(let i in stats.ever.tags) {
            if(stats.ever.tags.hasOwnProperty(i)) {
                tags.push({tag:i, number:stats.ever.tags[i]});
            }
        }
        
        tags.sort(function(a, b){return b.number - a.number});
        
        for(let i=0; i<10; i++) {
            tagsDesc.push(tags[i].tag);
            tagsDescNumber.push(tags[i].number);
        }
        
        let object = {
            id: info.id,
            type: info.type,
            labels: tagsDesc,
            datasets: [{data:tagsDescNumber}],
        };
        
        callback(object);
    },
};

const graphs = [
    {
        id:'articles_created_year',
        type:'line',
        label:'Articles créés cette année',
        labels:'month',
        builder: statsBuilder.articlesPerYear,
    },
    {
        id:'article_per_day',
        type:'bar',
        label:'Articles par jours',
        labels:'days',
        builder: statsBuilder.articlesPerDayOfMonth,
    },
    {
        id:'most_used_tags_year',
        type:'line',
        label:'Tags les plus utilisés cette année',
        labels:'month',
        builder: statsBuilder.mostUsedTagsPerYear,
    },
    {
        id:'most_used_tags_ever',
        type:'pie',
        label:'Tags les plus utilisés',
        builder: statsBuilder.mostUsedTagsEver,
    },
];


function getGraphsData(callback) {
    if(lastCalculationDate && Date.now()-lastCalculationDate < 21600000) {// 6 hours
        callback(resultCacheData);
    } else {
        console.log('must calculate graphs data...');
        indexAllDocs((year, days, ever) => {
            // slice(0) to copy the array.
            getAllStats({year, days, ever}, graphs.slice(0), (datas) => {
                lastCalculationDate = new Date();
                resultCacheData = datas;
                callback(datas);    
            });
        });
    }
}

function buildGraphs() {
    return graphs;
}


// privates

function indexAllDocs(callback) {
    let year = {};
    let days = {};
    let ever = {
        tags: [],
    };
    let timeStart = new Date();
    mongo.streamFind(article.Schema, (doc) => {
        indexDoc(doc, 'articles');
    }, () => {
        // END articles
        mongo.streamFind(shared.Schema, (doc) => {
            indexDoc(doc, 'shared');
        }, () => {
            // END shared
            callback(year, days, ever);
        }, {});
    }, {});
    
    function indexDoc(doc, collection) {
        // DOC
        let m = doc.publicationDate.getUTCMonth();
        let d = doc.publicationDate.getUTCDay();
        let y = doc.publicationDate.getUTCFullYear();
        
        if(!year[y]) {
            year[y] = {};
        }
        if(!year[y][m]) {
            year[y][m] = initSchemaYear();
        }
        if(collection == 'articles') {
            year[y][m].articles++;
        } else if(collection == 'shared') {
            year[y][m].shared++;
        }
        
        
        if(!days[d]) {
            days[d] = initSchemaDay();
        }
        if(collection == 'articles') {
            days[d].articles++;
        } else if(collection == 'shared') {
            days[d].shared++;
        }
        
        for(let t of doc.tags) {
            if(!year[y][m].tags[t.tag]) {
                year[y][m].tags[t.tag] = 0;
            }
            year[y][m].tags[t.tag]++;
            
            if(!ever.tags[t.tag]) {
                ever.tags[t.tag] = 0;
            }
            ever.tags[t.tag]++;
        }
    }
}


function initSchemaYear() {
    return {
        articles : 0,
        shared: 0,
        visits: 0,
        tags : {},
    }
}

function initSchemaDay() {
    return {
        articles : 0,
        shared: 0,
    }
}
// recursively get all datas
function getAllStats(stats, remainingGraphs, callback, datas) {
    if(remainingGraphs.length <= 0) {
        callback(datas);
        return;
    }
    if(!datas) {
        datas = [];
    }
    let currentGraph = remainingGraphs.pop();
    
    currentGraph.builder(currentGraph, stats, (data) => {
        datas.push(data);
        getAllStats(stats, remainingGraphs, callback, datas); 
    });
}



module.exports = {
    buildGraphs,
    getGraphsData,
};