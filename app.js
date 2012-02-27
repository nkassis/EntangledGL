
/**
 * Module dependencies.
 */

var express = require('express')
  , routes  = require('./routes')
  , sockio  = require('socket.io')
  , repl    = require('repl');

var app = module.exports = express.createServer()
  , io = sockio.listen(app);


// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);

app.listen(5001);


//Generates of unique player id's (just a sequence of number but whatever)
var genPlayerID = (function(){
  var last = 0;
  return function() {
    last += 1;
    return last;
  };

}());


//Command line server control
var servercli = repl.start('entangled>');

var players = {};
servercli.context.getPlayerList = function() {
  return players;
};
io.sockets.on('connection', function (socket) {
  //On player create set playerID and Nick
  socket.on('playerCreate', function(name){
    console.log(name + " has just connected");
    var playerID = genPlayerID(); //get unique player ID

    //set the new players information on the socket and send info
    //to current clients
    socket.set('playerID', playerID , function(){
      socket.set('playerNick', name, function(){

	var player ={playerID: playerID
		     , playerNick: name};

	//tell the new guy who everyone is
	socket.emit("playerList", players);

	players[playerID] = player;

	//Tell everyone who the new guy is
	socket.broadcast.emit('newPlayer', player);
      });
    });
  });

  //broadcast new transformation matrix for player
  socket.on('playerMove', function (data) {
    console.log(data);
    socket.get('playerID',function(err,playerID){
      socket.broadcast.emit('playerMove', {data: data
					   ,playerID: playerID});
    });
  });

  socket.on('disconnection', function() {
    socket.get('playerID', function(err, playerID) {
      delete players[playerID];
      socket.broadcast.emit('playerDisconnect', playerID);
    });
  });
  //Broadcast chat events
  socket.on('playerChat', function (msg) {
    console.log(msg);
    socket.get('playerID',function(err,playerID){
      socket.broadcast.emit('playerChat', {msg: msg
					   ,playerID: playerID});
    });
  });
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
