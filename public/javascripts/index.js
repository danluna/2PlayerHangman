$(document).ready(function() {
  var socket = io();
  var turn; // Is it currently our turn?

  // Start with hidden "Wait for player to leave" message
  $('#waitForDisconnect').hide();

  $('#joinButton').click(function(){
    socket.emit('join game', 'hi');
    $('#joinArea').hide();
    $('#waiting').hide();
    $('#waiting').css("visibility", "visible");
    $('#waiting').fadeIn(1000);
  });

  $('#guessButton').click(function() {
    var letter = $('#guess').val();
    socket.emit('guess', letter);

    // Check that the guess was not empty
    if(letter.length == 0) {
      $('#guessEmpty').hide();
      $('#guessEmpty').css('visibility', 'visible')
        .fadeIn(1000);
    }
    else {
      $('#guessEmpty').css('visibility', 'hidden');
    }
  });

  ///////// SOCKET EVENTS

  socket.on('players needed', function(needed) {
    $('#playersNeeded').html(needed);

    // Check if we should disable the join button
    // due to there being enough players
    if(needed == 0) {
      $('#joinButton').prop('disabled', true);
      //  .css('background', "transparent");
      $('#joinButton').attr('id', 'btn btn-danger btn-large');
      $('waitForDisconnect').fadeIn(1000);
    }
  });

  // Anonymous function recieves a boolean oneOrTwo
  // oneOrTwo: Tells us if this player will have player 1 or 2 status
  socket.on('game ready', function(oneOrTwo) {
    $('#waiting').css('visibility', 'hidden');
    $('#game').css('visibility', 'visible');
    $('#game').fadeIn(1000);

    turn = oneOrTwo;
    if(oneOrTwo) {
      $('#turn').html('Your turn!')
          .css('color', 'green');
    }
    else {
      $('#turn').html('Player 1\'s turn')
          .css('color', "blue");
      $('#guessButton').prop('disabled', true);
    }
  });

  socket.on('updatePlayers', function(numPlayers) {
    $('#playersNeeded').html(numPlayers);
  });

  socket.on('closeJoin', function() {
    $('#joinButton').prop("disabled", true);
    $('#joinButton').addClass('btn-disabled');
    $('#waitForDisconnect').fadeIn(1000);
  });
});