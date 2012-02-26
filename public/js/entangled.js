var Entangled = (function(entangled){
  var canvas
  , client
  , objects = []
  , socket
  , players  = {}
  , chatBox;
  entangled.init = function() {
    var nickname = prompt("Please enter a name for your player");
    chatBox = document.getElementById("entangled-chat");

    canvas  = document.getElementById("entangled-viewport");
    //initialize webgl context

    initSocket(nickname);
    //startRenderLoop();
  };

  function initSocket(nickname) {
    var socket =  io.connect('http://localhost');
    socket.on('playerList', function(playerList) {
      players = playerList;
      console.log(players); //DEBUG
    });
    socket.emit('playerCreate', nickname);
    socket.on('newPlayer',function(data){
      console.log("New player: "  + data.playerNick + " has just log in");
      players[data.playerID] = data;
    });

    socket.on('playerChat', function(msg){

    });

  };



  function drawObjects() {
    var i
    , numObjects = objects.length;

    for(i = 0; i < objects.length; i++) {
      //draw shapes
    }
  }

  function startRenderLoop(){

  }

  console.log("entangled started");

  return entangled;
}(Entangled || {}));

window.onload = Entangled.init;