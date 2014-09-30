$(document).ready(function() {
  var socket = io();

  $('#joinButton').click(function(){
    socket.emit('join game', 'hi');
    $('#joinArea').hide();
    $('#waiting').hide();
    $('#waiting').css("visibility", "visible");
    $('#waiting').fadeIn(1000);
  });

  socket.on('players needed', function(msg) {
    $('#playersNeeded').html(msg);
  });

  socket.on('game ready', function() {
    $('#waiting').html
    $('#waiting').css('visibility', 'hidden');
    $('#game').css('visibility', 'visible');
    $('#game').fadeIn(1000);
  });
});