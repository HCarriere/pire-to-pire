

function getExtractOf(content){
    if(!content){
        return "";
    }
    return content.substring(0,400);
}

/////////////////////////////////

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



/////////////////////////////////////

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
	isDateFromToday
}