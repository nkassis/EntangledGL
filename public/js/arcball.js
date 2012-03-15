var Entangled = (function(Entangled) {
  Entangled.Arcball = function(height,width) {
    if(!(this instanceof Entangled.Arcball)) {
      return new Entangled.Arcball(height, width);
    }

    var Epsilon = 0.00001;
    var Arcball = this;

    var savedClickVector = [0,0,0];
    var savedDragVector  = [0,0,0];

    Arcball.setBounds = function(newWidth, newHeight){
      if(newWidth < 1.0 || newHeight < 1.0){
	throw new Error("Error invalid width or height");
      }
      Arcball.adjustedWidth = 1.0 / ((newWidth - 1.0) * 0.5);
      Arcball.adjustedHeight = 1.0 / ((newHeight - 1.0) * 0.5);
    };

    //set bounds of arcball using initial values
    Arcball.setBounds(height,width);



    function mapToSphere(position) {
      var x = 1.0 - (position.x * Arcball.adjustedWidth);
      var y = 1.0 - (position.y * Arcball.adjustedHeight);

      var length = (x*x) +( y*y);

      if(length > 1.0) {
	var norm = 1.0 / Math.sqrt(length);
	return [x*norm, y*norm, 0.0];
      }else {
	return [x,y,Math.sqrt(1.0-length)];
      }
    };

    Arcball.click = function(position) {
      savedClickVector = mapToSphere(position);
    };

    Arcball.drag = function(position) {
      savedDragVector = mapToSphere(position);


      var perp = vec3.create();
      vec3.cross(savedClickVector,savedDragVector,perp);

      if(vec3.length(perp) > Epsilon) {
	return [perp[0],perp[1],perp[2],vec3.dot(savedClickVector,savedDragVector)];
      }else {
	return [0.0,0.0,0.0,0.0];
      }

    };

  };

  return Entangled;
}(Entangled || {}));
