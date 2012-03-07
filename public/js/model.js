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
  Entangled.model = function(spec,dest) {
    var model = dest
    ,   gl    = Entangled.client.gl;

    model.vertexArray = spec.vertexArray;
    model.normalArray = spec.normalArray;
    model.texCoordArray = spec.texCoordArray;

    switch(spec.type) {
    case "points":
      model.type = gl.POINTS;
      break;
    case "lines":
      model.type = gl.LINES;
      break;
    case "triangle_fan":
      model.type = gl.TRIANGLE_FAN;
      break;
    case "triangle_strip":
      model.type = gl.TRIANGLE_STRIP;
      break;
    default:
      model.type = gl.TRIANGLES;
      break;
    }

    //Prepare Array Buffers for drawing
    if(model.vertexArray) {
      model.vertexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertexArray), gl.STATIC_DRAW);
      model.vertexBuffer.itemSize = 3;
      model.vertexBuffer.numItems = model.vertexArray.length/3;

    }

    if(model.normalArray) {
      model.normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, model.normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normalArray), gl.STATIC_DRAW);
      model.normalBuffer.itemSize = 3;
      model.normalBuffer.numItems = model.normalArray.length/3;
    }

  };
  Entangled.models={};
  Entangled.loadModel = function(modelName, callback) {

    if(!Entangled.models[modelName]) {
      Entangled.models[modelName] = {};
      $.get('/models/'+ modelName, function(modelData) {
	Entangled.model(modelData,Entangled.models[modelName]);
      });
    }

    callback(Entangled.models[modelName]);

  };

  Entangled.loadModel("grid", function(model) {
      Entangled.grid = model;
  });

  return Entangled;
}(Entangled || {}));