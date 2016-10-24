


function getExtractOf(content){
    return content.substring(0,400);
}

function getStringDate(date){
    return  ("0"+date.getDate()).slice(-2)+
        "/"+("0"+date.getMonth()).slice(-2)+
        "/"+date.getFullYear()+
        " "+("0"+date.getHours()).slice(-2)+
        ":"+("0"+date.getMinutes()).slice(-2);
}


module.exports = {
    getExtractOf,
    getStringDate
}