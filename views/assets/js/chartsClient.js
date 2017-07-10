'use strict';

let charts;

// requesting the server for new datas
$(document).ready(() => {
    drawCanvas();
    
});

function getDatas() {
    $.ajax({
        method: 'POST',
        url: '/admin/graphsData'
    }).then((data) => {
        // console.log(JSON.stringify(data));
        updateCanvas(data);
    });
}


function drawCanvas() {
    charts = {};
    
    $('.graph-canvas').each(function(index) {
        let graph = {
            id: $(this).attr('id'),
            type: $(this).data('type'),
            labels: getLabels($(this).data('labels')),
        }
        // create graph
        let ctx = document.getElementById(graph.id).getContext('2d');
       
        let options = {};
        if(graph.type=='bar') {
            console.log(graph.id);
            options= {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        }
        let chart = new Chart(ctx, {
            type: graph.type,
            data: {
                labels: graph.labels,
                datasets: [],
            },
            options: options,
        });
        charts[graph.id] = chart;
    });
   /* updateCanvas([
        {
            id: 'article_per_day',
            datasets:[
                {
                    label:'coucou mdr',
                    data: [1, 3, 5, 4, 2, 1, 8],
                }
            ]
        },
        {
            id:'most_used_tags_ever',
            datasets: [
                {
                    data: [10,30,40],
                }
            ],
            labels: ['red', 'yellow', 'green']
        },
        {
            id:'visite_frequency',
            datasets: [
                {
                    label:'visitor',
                    data: [10,3,4,7],
                },
                {
                    label:'admin',
                    data: [3,1,2,2],
                }
            ]
        }
    ]); */
   getDatas();
}

function updateCanvas(data) {
    for(let o of data) {
        if(o.datasets) {
            for(let set of o.datasets) {
                if(o.type=='pie') {
                    let colors = [];
                    for(let c=0; c<set.data.length; c++) {
                        colors.push(getRandomColor());
                    }
                    set.backgroundColor = colors;
                } else if(o.type=='line'){
                    set.fill = false;
                    set.borderColor = getRandomColor();
                } else {
                    set.backgroundColor = getRandomColor();
                }
                addData(charts[o.id], set);
            }
        }
        if(o.labels) {
            setLabels(charts[o.id], o.labels);
        }
    }
}

function addData(chart, dataset) {
    chart.data.datasets.push(dataset);
    chart.update();
}

function getLabels(labels) {
    switch(labels) {
        case 'weeks':
            let weeks = [];
            for(let i = 1; i<=52; i++) {
                weeks.push(i);
            }
            return weeks;
            break;
        case 'month':
            return ['Janvier', 'Fevrier', 'Mars', 
                    'Avril', 'Mai', 'Juin',
                    'Juillet', 'Aout', 'Septembre', 
                    'Octobre', 'Novembre', 'Decembre'];
            break;
        case 'days':
            return ['Lundi','Mardi','Mercredi',
                     'Jeudi','Vendredi','Samedi',
                     'Dimanche'];
            break;
    }
    return [];
}

function setLabels(chart, labels) {
    chart.data.labels = labels;
}

function getRandomColor() {
    let color = 'rgba('+Math.floor(Math.random()*155+100)
        +','+Math.floor(Math.random()*205+50)
        +','+Math.floor(Math.random()*255)
        +',0.5)';
    return color;
}