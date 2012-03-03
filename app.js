/*
 * Copyright 2012, Nicolas Kassis
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Nicolas Kassis nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * Module dependencies.
 */

var express     = require('express')
  , routes      = require('./routes')
  , sockio      = require('socket.io')
  , repl        = require('repl')
  , objGen = require('./libs/objectGenerator')
  , models      = { sphere: objGen.makeSphere(10.0, 30, 15)}
  , app = module.exports = express.createServer()
  , io = sockio.listen(app)
  , port   = process.argv[3] || 5001
;

global.EntangledAddress = process.argv[2] || "localhost";

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

app.get('/models/:modelName', function(req, res) {
  res.send(models[req.params.modelName]);
});


app.listen(port);


//Generates of unique player id's (right now it's
//just a sequence of number but whatever, it works ;p)
var genPlayerID = (function(){
  var last = 0;
  return function(nick) {
    last += 1;
    return nick+"_"+last;
  };

}());


//Command line server control
//var servercli = repl.start('entangled>');

var players = {};
//servercli.context.getPlayerList = function() {
  //return players;
//};
io.sockets.on('connection', function (socket) {
  //On player create set playerID and Nick
  socket.on('playerCreate', function(name){
    console.log(name + " has just connected");
    var playerID = genPlayerID(name); //get unique player ID
    console.log(playerID + " " + name);
    //set the new players information on the socket and send info
    //to current clients
    socket.set('playerID', playerID , function(){
      socket.set('playerNick', name, function(){

	var player ={playerID: playerID
		     , playerNick: name};

	players[playerID] = player;

	//tell the new guy who he is
	socket.emit("selfPlayerID", playerID);

	//tell the new guy who everyone is
	socket.emit("playerList", players);

	//Tell everyone who the new guy is
	socket.broadcast.emit('newPlayer', player);
      });
    });
  });

  //broadcast new transformation matrix for player
  socket.on('playerUpdate', function (data) {
    socket.get('playerID',function(err,playerID){
      var update = {playerID : playerID};
      update[data.property] = data.value;
      socket.broadcast.emit('playerUpdate', update);
    });
  });

  //Broadcast chat events
  socket.on('playerChat', function (msg) {
    socket.get('playerID',function(err,playerID){
      socket.broadcast.emit('playerChat', {msg: msg
					   ,playerID: playerID});
    });
  });


  //Notifying clients of a closing client.
  socket.on('disconnect', function() {
    socket.get('playerID', function(err, playerID) {
      delete players[playerID];
      socket.broadcast.emit('playerDisconnect', playerID);
    });
  });
  
});

console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
