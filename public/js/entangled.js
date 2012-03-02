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
  , players = entangled.players = {}
  , chatBox;

  /**
   * Initialize Entangled
   */
  entangled.init = function() {
    var nickname = prompt("Please enter a name for your player");
    chatBox = document.getElementById("entangled-chat");

    canvas  = document.getElementById("entangled-viewport");
    //initialize webgl context


    client = Entangled.renderingClient;
    client.init(canvas);
    entangled.client = client;
    client.startRenderingLoop();
    initSocket(nickname);
    initEvents();
    console.log("entangled started");
  };

  /*
   * Initialize the Websocket connection to server
   * Sets up some of the websocket events and actions
   */
  function initSocket(nickname) {
    var socket =  io.connect('http://localhost');

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


    socket.on('playerChat', function(msg){
      $("<span>"+msg.playerID+": "+msg.msg+"</span>").appendTo(chatBox);
    });

    socket.on('playerDisconnect', function(playerID) {
      delete players[playerID];
    });
  };

  entangled.moveForward = function() {
    players[entangled.playerID].position[2] += 1;
  };

  entangled.moveBackward = function() {
    players[entangled.playerID].position[2] -= 1;
  };

  entangled.strifeLeft = function() {
    players[entangled.playerID].position[0] += 1;
  };

  entangled.strifeRight = function() {
    players[entangled.playerID].position[0] -= 1;
  };



  function initEvents() {
    $("body").keydown(function(e) {
      switch(e.which) {
      case 38:
	Entangled.moveForward();
	break;
      case 40:
	Entangled.moveBackward();
	break;
      case 37:
	Entangled.strifeLeft();
	break;
      case 39:
	Entangled.strifeRight();
	break;
      }
      return false;
    });
  }




  return entangled;
}(Entangled || {}));

window.onload = Entangled.init;