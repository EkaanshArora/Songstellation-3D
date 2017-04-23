// client-side js
// run by the browser each time your view template is loaded

// by default, you've got jQuery,
// add other scripts at the bottom of index.html

$(function() {
  console.log('hello world :o');

  $('form').submit(function(event) {
    event.preventDefault();
    
    let query = $('input').val();
    let context = $('input[name="context"]:checked').val();
    
    $.get('/search?' + $.param({context: context, query: query}), function(data) {
      $('#results').empty();
      $('input[type="text"]').val('');
      $('input').focus();
      
      data.tracks.items.forEach(function(track, index) {
        let newEl = $('<li onClick="getFeatures(&apos;' + track.id + '&apos;)"></li>').text(track.name + '   |   ' + track.artists[0].name);
        $('#results').append(newEl);
      });
    });
  });

});
