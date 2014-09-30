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
    Player1, Player2,  // Stores Socket for each player
    playersInGame = 0;

io.on('connection', function(socket) {
    console.log('connected');

    socket.on('join game', function(msg){
        playersInGame++;

        // Store socket for the recently connected player
        if(playersInGame == 1) {
            Player1 = socket;
            console.log('Player ' + playersInGame + ' Joined the Game')
        }
        if(playersInGame == 2) {
            Player2 = socket;
            Player1.emit('game ready');  // Tell both players we are ready to begin
            Player2.emit('game ready');
            
            console.log('Player ' + playersInGame + ' Joined the Game')
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
