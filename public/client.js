// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log('hello world :o');

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
