$(document).ready(function() {
  var socket = io();
  var turn; // Is it currently our turn?
  var triesLeft = 8;

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

    // Check that the guess was not empty
    if(letter.length == 0) {
      $('#guessEmpty').hide();
      $('#guessEmpty').css('visibility', 'visible')
        .fadeIn(1000);
    }
    else {
      $('#guessEmpty').css('visibility', 'hidden');
      socket.emit('guess', letter);
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
      //$('#joinButton').attr('id', 'btn btn-danger btn-large');
      $('waitForDisconnect').show(1000);
    }
  });

  // Anonymous function recieves a boolean oneOrTwo
  // oneOrTwo: Tells us if this player will have player 1 or 2 status
  socket.on('game ready', function(oneOrTwo, wordLength) {
    $('#waiting').css('visibility', 'hidden');
    $('#game').css('visibility', 'visible');
    $('#game').fadeIn(1000);

    // Create string with empty letter spots of length wordLength
    var wrd = "";
    for (var i = 1; i < wordLength; i++) {
      wrd += "_ ";
    }
    $('#word').html(wrd);

    turn = oneOrTwo;
    if(oneOrTwo) {
      $('#turn').html('Your turn!')
          .css('color', 'green');
    }
    else {
      $('#turn').html('Your teammate is currently guessing a letter...')
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

  socket.on('already guessed', function() {
    $('#guessEmpty').html('That letter has already been guessed. Choose another!');
  });

  socket.on('letter found', function(word, letter) {
    triesLeft--;
    $('#word').html(word);
    $('#lettersGuessed').append("" + letter + " ");
    $('#tries').html(triesLeft);

    if(turn) {
      turn = false;
      $('#turn').html("Your teammate is currently guessing a letter...");
      $('#guessButton').prop('disabled', true);
    }
    else {  // It will now be 'this' players turn
      turn = true;
      $('#turn').html("Your turn!");
      $('#guessButton').prop('disabled', false);
    }
  });

  socket.on('wrong guess', function() {
    triesLeft--;
    $('#tries').html(triesLeft);
  });

  socket.on('game won', function(word) {
    $('#word').html(word);
  });
  
});

