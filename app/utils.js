const md5 = require('md5');


function getHTMLContent(content) {
    content = content.replace(/\n/g,'<br>');
    content = content.replace(/\t/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    content = content.replace(/\r/g,'&nbsp;&nbsp;&nbsp;&nbsp;');
    return content;
}
//reverse of getHTMLContent
function getTextContentFromHTML(content) {
	content = content.replace('<br>','\n');
    content = content.replace('&nbsp;&nbsp;&nbsp;&nbsp;','\t');
	return content;
}


/////////////////////////////////////

function getTags(tagsRequest){
    var r  = [];
    var u = {};
    var tags = tagsRequest.trim().replace(/,/g,';').replace(/#/g,';').split(';');
    
    for (var tag in tags){
        var theTag = tags[tag].trim();
        if(theTag && !u.hasOwnProperty(theTag) ){
            r.push({tag:theTag});
            u[theTag] = 1;
        }
    }
    return r;
}

/////////////////////////////////


function encryptPassword(password) {
	return md5("0xxH_èdydhD70çàud"+password+"JdoDP\oe::;OE§§ùperTTOTHch68764xx");
}

/////////////////////////////////

function getShortName(name){
    return name.replace(new RegExp("[^a-zA-Z ]+", "g"),'').trim().replace(/ /g,'-')+"-"+generateRandomId();
}

/////////////////////////////////

function generateRandomId() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
}

/////////////////////////////////

function getExtractOf(content){
    if(!content){
        return "";
    }
    return content.substring(0,400);
}

/////////////////////////////////
//TODO : si date ajourdui, pas de date, juste heure
function getStringDate(date){
    if(!date){
        return "une date inconnue...";
    }
    return  ("0"+date.getDate()).slice(-2)+
        "/"+("0"+date.getMonth()).slice(-2)+
        "/"+date.getFullYear()+
        " "+("0"+date.getHours()).slice(-2)+
        ":"+("0"+date.getMinutes()).slice(-2);
}



/////////////////////////////////

function getStringDateHour(date){
	return ("0"+date.getHours()).slice(-2)+
        ":"+("0"+date.getMinutes()).slice(-2)+
        ":"+("0"+date.getSeconds()).slice(-2);
}

function getStringDateDay(date){
	return  ("0"+date.getDate()).slice(-2)+
        "/"+("0"+date.getMonth()).slice(-2)+
        "/"+date.getFullYear();
}

function isDateFromToday(date){
	return getStringDateDay(date) === getStringDateDay(new Date());
}


/**
si date aujourd'hui : que l'heure
sinon, date.
*/
function getSimpleStringDate(date){
	if(isDateFromToday(date)){
		return getStringDateHour(date);
	}else{
		return getStringDateDay(date);
	}
}

module.exports = {
    getExtractOf,
    getStringDate,
	getSimpleStringDate,
	getStringDateHour,
	getStringDateDay,
	isDateFromToday,
    getShortName,
	encryptPassword,
	getTags,
	getHTMLContent,
	getTextContentFromHTML
}