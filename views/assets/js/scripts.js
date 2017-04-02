
$(document).ready(function(){
    
    /* form-data-couple event handler */
    $('.form-data-couple input').on('keyup',function() {
        if($(this).val() === $(this).attr('value')){
            //normal
            //$(this).css("color","#222");
            $(this).removeClass("modified");
        }else{
            //modified
            //$(this).css("color","black");
            $(this).addClass("modified");
        }
    })
    
    
    /* auto select input field */
    $(".auto-select").select();
	
	$('html').keypress(function(event) {
		konamiPress(event);
	})
})

//Easter egg.
const konamiCode =[
	"ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight"
];
var konamiCurrentStep = 0;
function konamiPress(event) {
	if(konamiCurrentStep >= konamiCode.length){
		return;
	}
	if(event.key === konamiCode[konamiCurrentStep]) {
		konamiCurrentStep++;
	}
	if(konamiCurrentStep == konamiCode.length) {
		easterEgg();
		konamiCurrentStep = 666;
	}
}
function easterEgg() {
	console.log('Easter egg !')
	
	$('body').css('background-image','url(/images/wxp.png)');
	$('body').css('background-position','top');
	$('.website-title, .top-name').text("Windows XP");
	$('.website-title, .top-name').css("color","#fff");
}

