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

var Entangled = (function(Entangled) {
  Entangled.renderingClient = (function(client) {
    var canvas
    , gl
    , shaderProgram;


    /**
     * initialize the rendering client
     * @param canvasElement
     */
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

      //make gl accessible to other objects
      client.gl = gl;
      gl.clearColor(0.0,0.0,0.0,1.0);
      gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);

    };

    /**
     * Compile shader from source
     */
    function createShader(type,string) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader,string);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
	console.log(string);
	console.log(gl.getShaderInfoLog(shader));
	throw "Shader compilation failed";
	return null;
      }

      return shader;
    };

    /**
     * Gets a source code from shaders through ajax request
     * @param {String} name
     * @param {Number} type gl.FRAGMENT_SHADER or gl.VERTEX_SHADER
     * @param extraArgs arguments to pass to callback
     * @param {Function} callback the function to be called when we get the ajax response
     */
    function getShader(name,type,extraArgs,callback) {
      $.get('/shaders/' + name,function(data){
	callback(createShader(type,data),extraArgs);
      });
    }

    /**
     * Initialize the shaders compiles them and links them into a shader program
     * @param {Function} callback
     */
    function initShaders(callback) {
      //getShaders asyncronously
      getShader("phong-vs.glsl", gl.VERTEX_SHADER, null, function(vertexShader) {
	getShader("phong-fs.glsl", gl.FRAGMENT_SHADER, vertexShader, function(fragmentShader,vertexShader) {
	  shaderProgram = gl.createProgram();
	  gl.attachShader(shaderProgram, vertexShader);
	  gl.attachShader(shaderProgram, fragmentShader);
	  gl.linkProgram(shaderProgram);

	  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
	    throw "Could not initialise shaders";
	  }

	  gl.useProgram(shaderProgram);

	  shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "position");
	  gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

	  shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "normal");
	  gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);


	  shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "PMatrix");
	  shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "MVMatrix");
	  shaderProgram.normalMatrixUniform = gl.getUniformLocation(shaderProgram, "NMatrix");
	  shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "ambientColor");

          shaderProgram.pointLigthDirectionUniform = gl.getUniformLocation(shaderProgram, "pointLightDirection");
          shaderProgram.diffuseColorUniform = gl.getUniformLocation(shaderProgram, "diffuseColor");
	  shaderProgram.specularColorUniform = gl.getUniformLocation(shaderProgram, "specularColor");

	  gl.uniform4f(shaderProgram.ambiantColorUniform, 0.1, 0.1, 0.1,1.0);
	  gl.uniform4f(shaderProgram.diffuseColorUniform, 0.8, 0.1, 0.8,1.0);
	  gl.uniform3f(shaderProgram.pointLightDirectionUniform, 10, -100 , 10);
	  gl.uniform4f(shaderProgram.specularColor, 0.5, 0.5 , 0.5, 1.0);

	  callback();
	});
      });
    }

    var pMatrix       = mat4.create()
      , mvMatrix      = mat4.create()
      , nMatrix       = mat4.create()
      , mvMatrixStack = []
      , eyePosition   = [0,50,-50]
    ;

     function mvPushMatrix() {
        var copy = mat4.create();
        mat4.set(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }


    var setMatrixUniforms = function() {
      gl.useProgram(shaderProgram);
      gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
      gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);

      var normalMatrix = mat3.create();
      mat4.toInverseMat3(mvMatrix, normalMatrix);
      mat3.transpose(normalMatrix);
      gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, normalMatrix);
    };

    function render(){
      var players = Entangled.players
        , numObjects = players.length
        , model
        , position
      ;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      mat4.perspective(45, canvas.width/canvas.height, 0.1, 1000.0, pMatrix);
      mat4.identity(mvMatrix);
      mat4.lookAt(eyePosition
		  ,[0,0,0]
		  ,[0,1,0]
		  ,mvMatrix
		 );



      for(var player in players) {
	if(players.hasOwnProperty(player)) {
	  position = players[player].position;
	  model  = players[player].model;
	  if(model) {

	    //Move to where player is
	    mvPushMatrix();
	    mat4.translate(mvMatrix,position);
	    setMatrixUniforms();
	    mvPopMatrix(); //get back to origin

	    gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
				   model.vertexBuffer.itemSize,
				   gl.FLOAT,
				   false,
				   0,
				   0);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
				   model.normalBuffer.itemSize,
				   gl.FLOAT,
				   false,
				   0,
				   0);
	    gl.drawArrays(gl.TRIANGLES, 0, model.vertexBuffer.numItems);
	  }
	}
      }



    }


    function renderLoop(){
      requestAnimFrame(renderLoop);
      render();
    };

    /**
     * Start Rendering loop, uses requestAnimationFrame
     */
    client.startRenderingLoop = function() {
      initShaders(renderLoop);
    };

    return client;

  }(Entangled.renderingClient || {}));

  return Entangled;
}(Entangled || {}));