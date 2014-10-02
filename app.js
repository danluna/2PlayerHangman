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

server.listen(3000);

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
var playersConnected = 0,
    lettersGuessed = [],
    playerTurn = 1,
    playersInGame = 0;

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
            Player1.emit('game ready', true);
            Player2.emit('game ready', false);

            // Tell connections still on home screen that they cannot join
            // the game at this point. (2 players max.)
            io.emit('closeJoin');

            console.log('Player ' + playersInGame + ' Joined the Game')
        }

    });

    socket.on('guess', function(letter) {
        console.log('letter is empty ' + letter + " after");
    });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

module.exports = app;
