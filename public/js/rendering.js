Entangled.renderingClient = (function(client) {
  var canvas
  , gl;
  client.init = function(canvasElement){
    canvas = canvasElement;
    gl = canvas.getContext('webgl');
    if(!gl) {
      gl = canvas.getContext('experimental-webgl');
    }
    if(!gl) {
      console.log("There was an error initializing WebGL. Exiting");
      return;
    }

    function initViewport(){
      gl.clearColor(0.0,0.0,0.0,0.0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
    }



  };

}(Entangled.renderingClient || {}));