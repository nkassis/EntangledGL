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

var Entangled = (function(entangled){
  var canvas
    , client
    , objects = []
    , socket
    , players = entangled.players = []
    , chatBox
    , arcball
    , drag = false
    , startDrag = [0,0,0]
    , translation = [0,0,0]
  ;

  /**
   * Initialize Entangled
   */
  entangled.init = function() {
    entangled.nickname = prompt("Please enter a name for your player");
    chatBox = document.getElementById("chatlog");

    canvas  = document.getElementById("entangled-viewport");
    //initialize webgl context


    client = Entangled.renderingClient;
    entangled.client = client;
    //after the server connection is setup start the rendering loop.
    initSocket(entangled.nickname);

    client.init(canvas, function() {
      arcball = Entangled.Arcball(canvas.height,canvas.width);
      client.lastRot = mat4.identity(mat4.create());
      client.currentRot = mat4.identity(mat4.create());

      initEvents();
      console.log("entangled started");
      gameLoop();
    });
  };

  /**
   * Game Loop
   */
  function gameLoop(){
    requestAnimFrame(gameLoop);
    entangled.client.render();
  };

  /*
   * Initialize the Websocket connection to server
   * Sets up some of the websocket events and actions
   */
  function initSocket(nickname) {
    var address = window.location.origin;
    socket =  io.connect(address);
    /**
     * Get self player ID
     */
    socket.on('selfPlayerID',function(playerID) {
     Entangled.playerID = playerID;
    });

    /**
     * Load initial list of players
     */
    socket.on('playerList', function(playerList) {

      for(var player in playerList) {
	if(playerList.hasOwnProperty(player)){
	  players[playerList[player].playerID] = entangled.player(playerList[player]);
	}
      }
    });

    socket.emit('playerCreate', nickname);

    socket.on('newPlayer',function(data){
      players[data.playerID] = Entangled.player(data);
    });


    socket.on('playerChat', entangled.addToChat);

    socket.on('playerUpdate', function(update) {
      entangled.players[update.playerID].position = update.position;
    });

    socket.on('playerDisconnect', function(playerID) {
      delete players[playerID];
    });
  };

  entangled.addToChat=function(msg) {
    $("<div class=\"message\">"+Entangled.players[msg.playerID].playerNick+": "+msg.msg+"</div>").appendTo(chatBox);
    var height = $("#chatlog").children().length;
    $("#chatlog").scrollTop(height*100);
  };

  entangled.moveForward = function() {
    players[entangled.playerID].position[2] += 1;
    return {property: "position",
	    value: entangled.players[entangled.playerID].position};

  };

  entangled.moveBackward = function() {
    players[entangled.playerID].position[2] -= 1;

    return {property: "position",
	    value: entangled.players[entangled.playerID].position};
  };

  entangled.strifeLeft = function() {
    players[entangled.playerID].position[0] += 1;
    return {property: "position",
	    value: entangled.players[entangled.playerID].position};

  };

  entangled.strifeRight = function() {
    players[entangled.playerID].position[0] -= 1;
    return {property: "position",
	    value: entangled.players[entangled.playerID].position};

  };

  entangled.playerUpdate=function(updater)  {
    var update = updater();
    socket.emit('playerUpdate',update);
  };




  function initEvents() {
    $(document).keydown(function(e) {
      var ret=true;
      //Don't grab keystrokes meant for the chat input field
      if(e.target == document.getElementById("chat-textbox")) {
	if( e.which == 13 ) {
	  var msg = $("<div>"+$("#chat-textbox").val()+"</div>").text();
	  if(msg) {
	    $("#chat-textbox").val('');
	    socket.emit('playerChat', msg);
	    Entangled.addToChat({  playerID: entangled.playerID
				   , msg: msg});
	  }
	  return false;
	}
	return true;
      }

      switch(e.which) {
      case 87:
      case 38:
	Entangled.playerUpdate(Entangled.moveForward);
	ret=false;
	break;
      case 83:
      case 40:
	Entangled.playerUpdate(Entangled.moveBackward);
	ret=false;
	break;
      case 65:
      case 37:
	Entangled.playerUpdate(Entangled.strifeLeft);
	ret=false;
	break;
      case 68:
      case 39:
	Entangled.playerUpdate(Entangled.strifeRight);
	ret=false;
	break;
      }

      return ret;

    });



    $(canvas).mousedown(
      function(e){
	drag = true;
	arcball.click(getCursorPosition(e));
	client.currentRot = client.lastRot;
	return false;
      });
    $(canvas).mousemove(
      function(e) {
	if(drag) {
	    var quat = arcball.drag(getCursorPosition(e));
	    client.currentRot = mat4.multiply(quat4.toMat4(quat),client.lastRot);
	}
	return false;
      });

    $(canvas).mouseup(
      function(e){
	drag=false;
	client.lastRot = client.currentRot;
      });
  };
  return entangled;
}(Entangled || {}));

window.addEventListener("load", Entangled.init);
