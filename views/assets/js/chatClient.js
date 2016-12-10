// scr="/js/socket.io.min.js"
$(document).ready(function(){
	
	var socket = io("http://localhost:8080");

	socket.on('message', function (data) {
		$('#chat-zone .in').append(
		`<div class="chat-message">
			<div class="chat-date meta date">(${(data.date)})</div>
			<a href="user/${data.author}" class="chat-author meta user">${data.author}</a>:
			<div class="chat-content">${data.message}</div>
		</div>`
		);
		scrollBottom();
	});

	$('#chat_form').submit(function(){
		socket.emit('message', {
			message:$('#message').val(),
			author:$('#message_author').val(),
			keyAuth:$('#message_keyauth').val()
		});
		$('#message').val('');
		return false;
	});

});

function scrollBottom(){
	$('#chat-zone').animate({
		scrollTop: $('#chat-zone .in').height()
	},300);
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