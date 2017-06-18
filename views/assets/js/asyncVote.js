'use strict';


$(document).ready(function() {

	$('form.noaction').submit(function(e) {
		e.preventDefault();
		return false;
	});

	$('button.async-call').click(function(e) {
		postFormFromButton($(e.target));
	});
});


/**
 * [postFormFromButton description]
 * @param  {[type]} button
 */
function postFormFromButton(button) {
	button.prop('disabled', true);

	let action = button.attr('formaction');
	if(!action) {
		action = button.parent('form').attr('action');
	}

	$.ajax({
		url: action,
		type: 'POST',
		dataType: 'html',
		timeout: 0,
		data: button.parent('form').serialize(),
		success: function(result) {
			console.log(result);
			button.prop('disabled', false);
			let resultCode = JSON.parse(result);
			if(resultCode.err) {
				console.log(err);
			} else {
				if(resultCode.result == 'OK') {
					updateVoteButton(button);
				}
			}
		},
	});
}

function updateVoteButton(button) {
	let votes = Number(button.children('.num').text());
	votes += 1;
	button.children('.num').text(votes);
}