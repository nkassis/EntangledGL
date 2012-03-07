/*
 * Some(most?) of the algorithms to generate shapes in here are based on
 * those found in OpenGL Superbible 5th edition by Richard S. Writght
 *
 * But I modified them for javascript and all bugs are probably my fault ;p
 */


exports.makeSphere = function(radius,slices,stacks) {
  var sphere = {   vertexArray: []
		 , normalArray: []
		 , texCoordArray: []
	       };
  var drho = Math.PI / stacks
    , dtheta = 2.0 * Math.PI /slices
    , ds = 1.0 / slices
    , dt = 1.0 / stacks
    , t = 1.0
    , s = 0.0
    ;

  for(var i = 0; i < stacks; i++) {
    var rho = i * drho
      , srho = Math.sin(rho)
      , crho = Math.cos(rho)
      , srhodrho = Math.sin(rho + drho)
      , crhodrho = Math.cos(rho + drho)
      ;

    s = 0.0;


    for(var j = 0; j < slices; j++) {
      var theta  = (j == slices) ? 0.0 : j * dtheta;
      var stheta = -Math.sin(theta);
      var ctheta = Math.cos(theta);

      var x = stheta * srho;
      var y = ctheta * srho;
      var z = crho;

      var vert0 = [];
      var normal0 = [];
      var tex0 = [];

      tex0[0]    = s;
      tex0[1]    = t;
      normal0[0] = x;
      normal0[1] = y;
      normal0[2] = z;
      vert0[0]   = x * radius;
      vert0[1]   = y * radius;
      vert0[2]   = z * radius;

      x = stheta * srhodrho;
      y = ctheta * srhodrho;
      z = crhodrho;

      var vert1 = [];
      var normal1 = [];
      var tex1 = [];

      tex1[0]    = s;
      tex1[1]    = t - dt;
      normal1[0] = x;
      normal1[1] = y;
      normal1[2] = z;
      vert1[0]   = x * radius;
      vert1[1]   = y * radius;
      vert1[2]   = z * radius;

      theta = ((j+1) == slices) ? 0.0 : (j+1) * dtheta;
      stheta = -Math.sin(theta);
      ctheta =  Math.cos(theta);

      x = stheta * srho;
      y = ctheta * srho;
      z = crho;

      var vert2 = [];
      var normal2 = [];
      var tex2 = [];

      tex2[0]    = s;
      tex2[1]    = t;
      normal2[0] = x;
      normal2[1] = y;
      normal2[2] = z;
      vert2[0]   = x * radius;
      vert2[1]   = y * radius;
      vert2[2]   = z * radius;

      x = stheta * srhodrho;
      y = ctheta * srhodrho;
      z = crhodrho;

      var vert3 = [];
      var normal3 = [];
      var tex3 = [];

      tex3[0]    = s;
      tex3[1]    = t - dt;
      normal3[0] = x;
      normal3[1] = y;
      normal3[2] = z;
      vert3[0]   = x * radius;
      vert3[1]   = y * radius;
      vert3[2]   = z * radius;


      var vertices = [vert0, vert1, vert2, vert1, vert3, vert2];
      var normals  = [normal0, normal1, normal2, normal1, normal3, normal2];
      var texCoords = [tex0, tex1, tex2, tex1, tex3, tex2];

      for(var k=0; k < 6; k++) {
	for(var l=0; l < 3; l++) {
	  sphere.vertexArray.push(vertices[k][l]);
	  sphere.normalArray.push(normals[k][l]);
	}
	for(l=0; l< 2; l++) {
	  sphere.texCoordArray.push(texCoords[k][l]);
	}
      }
    }

  }
  return sphere;

};


/**
 * Make a grid on the x,z plane
 *
 * @param {Number} startx  begining of grid in x direction
 * @param {Number} endx    end of grid in x direction
 * @param {Number} startz  begining of grid in z direction
 * @param {Number} endz    end of grid in z direction
 * @param {Number} y       height of the grid
 * @param {Number} spacing spacing between line in grid
 */
exports.makeGrid = function(startx, endx, startz, endz, y, spacing) {
 var grid = { vertexArray: []
	     ,normalArray: []
   	     ,type       : "lines"}
   , i
 ;

  for(i=startx; Math.abs(i) <= Math.abs(endx); i += spacing) {

    grid.vertexArray.push.apply(grid.vertexArray, [i, y, startz]);
    grid.vertexArray.push.apply(grid.vertexArray, [i, y, endz]);

    grid.normalArray.push.apply(grid.normalArray, [0, 1, 0]);
    grid.normalArray.push.apply(grid.normalArray, [0, 1, 0]);

  }

  for(i =startz; Math.abs(i) <= Math.abs(endz); i += spacing) {

    grid.vertexArray.push.apply(grid.vertexArray, [startx, y, i]);
    grid.vertexArray.push.apply(grid.vertexArray, [endx, y, i]);

    grid.normalArray.push.apply(grid.normalArray, [0, 1, 0]);
    grid.normalArray.push.apply(grid.normalArray, [0, 1, 0]);

  }

  return grid;
};