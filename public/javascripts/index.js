$(document).ready(function() {
  var socket = io();
  var turn; // Is it currently our turn?
  var triesLeft;
  var inGame = false;

  // Hide error and warning messages for now
  $('#waitForDisconnect').hide();
  $('#guessWarning').hide();

  $('#joinButton').click(function(){
    socket.emit('join game', 'hi');
    $('#joinArea').hide();
    $('#waiting').hide();
    $('#waiting').css("visibility", "visible");
    $('#waiting').fadeIn(1000);
    inGame = true;
  });

  $('#guessButton').click(function() {
    var letter = $('#guess').val();

    // Check that the guess was not empty
    if(letter.length == 0) {
      $('#guessWarning').hide();
      $('#guessWarning').fadeIn(1000);
      $('#guessWarning').html("Please submit a letter");
      setTimeout(function() { $('#guessWarning').fadeOut(1000); }, 5000);
    }
    else {
      $('#guessEmpty').css('visibility', 'hidden');
      $('#guess').val("");
      socket.emit('guess', letter, triesLeft - 1);
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
  socket.on('game ready', function(oneOrTwo, wordLength, triesAllowed) {
    $('#waiting').css('visibility', 'hidden');
    $('#game').css('visibility', 'visible');
    $('#game').fadeIn(1000);
    triesLeft = triesAllowed;

    // Create string with empty letter spots of length wordLength
    var wrd = "";
    for (var i = 0; i < wordLength; i++) {
      wrd += "_ ";
    }

    // Set different attributes of the game to 'starter settings'
    $('#word').html(wrd);
    $('#tries').html(triesLeft);
    $('#lettersGuessed').html("");

    turn = oneOrTwo;
    if(oneOrTwo) {
      $('#turn').html('Your turn!');
      $('#guessButton').prop('disabled', false);
    }
    else {
      $('#turn').html('Your teammate is currently guessing a letter...');
      $('#guessButton').prop('disabled', true);
    }
  });

  socket.on('updatePlayers', function(numPlayers) {
    $('#playersNeeded').html(numPlayers);
  });

  socket.on('closeJoin', function() {
    $('#joinButton').prop("disabled", true);
    $('#joinButton').addClass('btn-disabled');
  });

  socket.on('already guessed', function() {
    $('#guessWarning').html('That letter has already been guessed');
    $('#guessWarning').fadeIn(1000);
    setTimeout(function() { $('#guessWarning').fadeOut(1000); }, 5000);
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

  socket.on('wrong guess', function(letter) {
    triesLeft--;
    $('#tries').html(triesLeft);
    $('#lettersGuessed').append("" + letter + " ");

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

  // word: The final word (full word if won or empty string if lost)
  // wonOrLose: Boolean, true is winner, false if loser
  socket.on('game finished', function(word, winOrLose) {

    // Client will no longer be in the game
    inGame = false;

    // Display message based on winning or losing
    if(winOrLose) {
      $('#word').html(word);
      $('#gratz').html("Congratulations!");
    }
    else {
      $('#word').html("");
      $('#gratz').html("Game Over");
    }

    $('#gameOverRedirect').html('You will be redirected to the start area in: <span id="counter"></span>');
    $('#guessButtonArea').hide();
    $('#lettersGuessed').hide();
    $('#triesRemaining').hide();
    $('#guess').hide();
    $('#turn').hide();

    $('#counter').html(5);
    var counter = 4;
    var timesRun = 0;

    // Run a counter for the user to see before they
    // are redirected back to the start page
    var interval = setInterval( function() {
      $('#counter').html(counter);
      if(timesRun==4) { 
        window.location.href = 'http://twoplayerhangman.herokuapp.com';
        clearInterval(interval);
      }

      timesRun++;
      counter--;
    }, 1000);
  });

  socket.on('player disconnect', function(playNeed) {
    if(inGame) { // Take in game player to the waiting screen
      $('#waiting').css('visibility', 'visible');
      $('#game').css('visibility', 'hidden');
      $('#game').hide();
    }
    else {  // This player was is in the start screen
      $('#playersNeeded').html(playNeed);
      $('#joinButton').prop('disabled', false);
    }
  });
 
});

