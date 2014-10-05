var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.set('port', process.env.PORT || 3000);
server.listen(app.get('port'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

// game 
var words = ["acres", "adult", "border", "calm", "canal", "donkey",
             "exchange", "garage", "independent", "mathematics", "rubbed",
             "promised", "mission", "mysterious", "floating", "official",
             "recall"];

var playersConnected = 0,
    lettersGuessed = [],
    playerTurn = 1,
    playersInGame = 0,
    word = words[Math.floor(Math.random() * words.length)],
    letterFound = true;

// Boolean array mapping true to word spot already guessed correctly and false otherwise
var lettersFound; // = new Array(word.length).map(Boolean.prototype.valueOf, false);

var Player1, Player2;  // Stores Socket for joined players
    

io.on('connection', function(socket) {
    console.log('connected');

    // Let the home page know how many players are needed to begin the game
    socket.emit('players needed', 2 - playersInGame);

    socket.on('join game', function(msg){
        playersInGame++;

        // Update players still in "Join Game screen" 
        io.emit('updatePlayers', 2 - playersInGame);

        // Store socket for the recently connected player
        if(playersInGame == 1) {
            Player1 = socket;
            console.log('Player ' + playersInGame + ' Joined the Game')
        }
        if(playersInGame == 2) {
            Player2 = socket;
            // Tell players we are ready to begin
            // True flag lets the player know if they are 1 or 2
            Player1.emit('game ready', true, word.length, word.length + 8);
            Player2.emit('game ready', false, word.length, word.length + 8);

            // Get a new word for this game
            word = words[Math.floor(Math.random() * words.length)];
            lettersFound = new Array(word.length).map(Boolean.prototype.valueOf, false);

            // Tell connections still on home screen that they cannot join
            // the game at this point. (2 players max.)
            io.emit('closeJoin');

            console.log('Player ' + playersInGame + ' Joined the Game')
        }

    });

    // Guess button click triggered event
    socket.on('guess', function(letter, triesLeft) {

        // 'Game over' if the players have no tries left
        if(!triesLeft) {
            Player1.emit('game finished', "", false);
            Player2.emit('game finished', "", false);
        }

        var alreadyGuessed = false;
        // Check if this letter has already been guessed
        if(lettersGuessed.indexOf(letter) != -1) {
            alreadyGuessed = true;
            console.log('Letters has already been guessed');
            if(playerTurn==1) {
                Player1.emit('already guessed');
            }
            else {
                Player2.emit('already guessed');
            }
        }
        else { // This letter had not been guessed
            letterFound = false;
            lettersGuessed.push(letter);

            // testing delete this
            console.log('letter not been guessed');
            console.log(lettersFound);

            // Look through the word for guess match
            for(var i = 0; i < word.length; i++) {
                if(word.charAt(i) == letter) {
                    lettersFound[i] = true;
                    letterFound = true;
                }
            }


            // Update client based on having guessed correctly
            if(letterFound) {
                var wordComplete = true;
                // Check if the complete word has been guessed
                for(var i = 0; i < word.length; i++) {
                    if(!lettersFound[i]) {
                        wordComplete = false;
                        i = word.length;
                    }
                }

                var wordProgress = '';
                // Construct the word to be passed to the client
                for(var i = 0; i < word.length; i++) {
                    if(lettersFound[i]) {
                        wordProgress += word.charAt(i) + " ";
                    }
                    else {
                        wordProgress += "_ ";
                    }
                }

                if(wordComplete) {
                    // Emit game has been won
                    Player1.emit('game finished', wordProgress, true);
                    Player2.emit('game finished', wordProgress, true);
                }
                else {  // Emit the new partial word
                    Player1.emit('letter found', wordProgress, letter);
                    Player2.emit('letter found', wordProgress, letter);
                    //console.log(wordProgress);
                }
            }
            else { // The letter was not found
                Player1.emit('wrong guess', letter);
                Player2.emit('wrong guess', letter);
                //letterWasFound = false; delete this?
            }
        }

        if(!alreadyGuessed) {
            if(playerTurn ==1) { playerTurn++; }
            else { playerTurn--; }
        }

    });

    socket.on('disconnect', function() {
        
        // Check if the disconnect came from a player currently in the game
        // If so, we need to update all other clients
        if(socket == Player1 || socket == Player2) {
            console.log('player disconnected from game!');
            io.emit('player disconnect', Math.abs(playersInGame - 3));
            playersInGame--;
            lettersGuessed = [];
            playerTurn = 1;

            if(socket == Player1) {
                Player1 = Player2;
            }
        }
  
    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;
