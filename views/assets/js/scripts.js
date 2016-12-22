
$(document).ready(function(){
    
    
    /* form-data-couple event handler */
    $('.form-data-couple input').on('keyup',function(){
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
})


