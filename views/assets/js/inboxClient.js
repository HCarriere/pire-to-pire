var selectedTab = "tab-in";

$(document).ready(function(){
	
	showTabs();
	
	$('.tab').on('click', function(){
		selectedTab = $(this).attr('id');
		showTabs();
		$('.tab').removeClass('selected');
		$(this).addClass('selected');
	})
	
	
})


function showTabs(){
	//console.log(selectedTab);
	if(selectedTab == "tab-in"){
		//recus
		$('#inbox-in').show();
		$('#inbox-out').hide();
	} else if(selectedTab == "tab-out"){
		//envoyés
		$('#inbox-out').show();
		$('#inbox-in').hide();
	}
}