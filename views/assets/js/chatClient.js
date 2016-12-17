// scr="/js/socket.io.min.js"
$(document).ready(function(){
	
	var address = $("#request_path").val();
	console.log("listening to "+address);
	var socket = io(address);//"http://localhost:5000"

	socket.on('message', function (data) {
		$('#chat-zone .in').append(
		`<div class="chat-message">
			<div class="chat-date meta date">(${(data.date)})</div>
			<a href="user/${data.author}" class="chat-author meta user">${data.author}</a>:
			<div class="chat-content">${data.message}</div>
		</div>`
		);
		scrollToBottomAnimated();
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

	scrollToBottom();
});

function scrollToBottomAnimated(){
	$('#chat-zone').animate({
		scrollTop: $('#chat-zone .in').height()
	},300);
}
function scrollToBottom(){
	$('#chat-zone').scrollTop( $('#chat-zone .in').height());
}

