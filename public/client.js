// client-side js
// run by the browser each time your view template is loaded

$(function() {
  $('form').submit(function(event) {
    event.preventDefault();
    
    let scopesList = '';
    
    $("#authorize-scopes input:checkbox:checked").each(function(){
      scopesList += $(this).val();
      scopesList += ',';
    });
    
    $.get('/authorize?' + $.param({scopes: scopesList}), function(data) {
      console.log(data)
      window.location = data;
    });
  });
});