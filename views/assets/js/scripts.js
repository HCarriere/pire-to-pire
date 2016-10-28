
$(document).ready(function(){
    
    
    /* form-data-couple event handler */
    $('.form-data-couple input').on('keyup',function(){
        if($(this).val() === $(this).attr('value')){
            //normal
            $(this).css("color","#666");
        }else{
            //modified
            $(this).css("color","black");
        }
    })
    
    
    /* auto select input field */
    $(".auto-select").select();
})


