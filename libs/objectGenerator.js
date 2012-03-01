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

      for(var k=0; i < 6; i++) {
	sphere.vertexArray.push.apply(sphere.vertexArray, vertices[k]);
	sphere.normalArray.push.apply(sphere.normalArray, normals[k]);
	sphere.texCoordArray.push.apply(sphere.texCoordArray, texCoords[k]);
      }

    }

  }
  return sphere;

};

