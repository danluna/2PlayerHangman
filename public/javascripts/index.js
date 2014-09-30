$(document).ready(function() {
  var socket = io();

  $('#joinButton').click(function(){
    socket.emit('join game', 'hi');
    $('#joinArea').hide();
    $('#gamez').css("visibility", "visible");
    $('#gamez').show();
  });

  socket.on('game ready', function() {
    $('#gamez').css('visibility', 'hidden');
  });
});