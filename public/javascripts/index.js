$(document).ready(function() {
  var socket = io();

  $('#joinButton').click(function(){
    socket.emit('join game', 'hi');
    $('#joinArea').hide();
    $('#waiting').hide();
    $('#waiting').css("visibility", "visible");
    $('#waiting').fadeIn(1000);
  });

  socket.on('game ready', function() {
    $('#gamez').css('visibility', 'hidden');
  });
});