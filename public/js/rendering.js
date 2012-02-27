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

	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "normal");
	gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);


	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "PMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "MVMatrix");
	shaderProgram.normalMatrixUniform = gl.getUniformLocation(shaderProgram, "NMatrix");

	callback();
      });
    });
  }


  function render(){
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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