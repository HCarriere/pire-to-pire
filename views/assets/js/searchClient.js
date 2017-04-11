
var tabs = [
	"articles",
	"shared",
	"news"
]
var selectedTab = tabs[0];

$(document).ready(function(){
	
	showContent();
	
	$('ul.search-tab li a').on('click', function(){
		selectedTab = $(this).attr('tab');
		showContent();
		$('ul.search-tab li a').removeClass('selected');
		$(this).addClass('selected');
	})
	
	
})


function showContent(){
	for(var i =0; i<tabs.length; i++) {
		if(tabs[i] == selectedTab) {
			$('#search-result-'+tabs[i]).fadeIn();
		} else {
			$('#search-result-'+tabs[i]).fadeOut();
		}
	}
}