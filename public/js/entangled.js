var Entangled = (function(entangled){
		   var canvas
		   ,   gl
		   , objects = [];
		   
		   entangled.init = function() {
		     canvas = document.getElementById("entangled-viewport");

		     //initialize webgl context
		     gl = canvas.getContext('webgl');
		     if(!gl) {
		       gl = canvas.getContext('experimental-webgl');
		     }
		     if(!gl) {
		       console.log("There was an error initializing WebGL. Exiting");
		       return;
		     }
		     
		     initViewport();
		     startRenderLoop();
		   };
		   

		   function initViewport(){
		     gl.clearColor(0.0,0.0,0.0,0.0);
		   }

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