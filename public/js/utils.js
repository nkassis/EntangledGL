/*
* General Utility functions
* Author: Nicolas Kassis <nic.kassis@gmail.com>
*
*/



/*
 * Get the minimum and maximum of an Array, if the array is to
 * big it has to do it recursively because funcitons like Math.min don't
 * take an infinite amount of arguments and that could have been inteligently
 * solved by taking a array instead. But we have to live with is and just accept
 * that somethings aren't perfect.
 */
if(Array.prototype.min === undefined){

  Array.prototype.min = function() {
    var increment = 50000;
    if(this.length > increment){
      var reduced_array = [];
      for(var i=0;i<this.length;i+=increment) {
	reduced_array.push(Math.min.apply(Math, this.slice(i,i+increment-1)));
      }
    }else {
      return Math.min.apply(Math, this);
    }
    return reduced_array.min();

  };

}
if(Array.prototype.max === undefined) {

  Array.prototype.max = function(array) {
    var increment = 50000;
    if(this.length > increment){
      var reduced_array = [];
      for(var i=0;i<this.length;i+=increment) {
	reduced_array.push(Math.max.apply(Math, this.slice(i,i+increment-1)));
      }
    }else {
      return Math.max.apply(Math, this);
    }
    return reduced_array.max();
  };

}


/*
 * Convert between degree and radians
 */
function degToRad(deg) {
  return (deg*Math.PI) / 180;
}

/*
 * Convert between radians and degrees
 */

function radToDeg(rad) {
  return (rad*180)/Math.PI;
}



/*
 * Create a new object using passed in object as prototype
 * From Douglas Crockford - Javascript the Good Parts Chapter 3 Objects page 22.
 */
if(typeof Object.beget !== 'function') {
  Object.beget = function(o) {
    var F = function() {};
    F.prototype = o;
    return new F();
  };
}


/*
 * Get cursor positon relative to the target of the element.
 */
function getCursorPosition(e){
	var x;
	var y;
	if (e.pageX != undefined && e.pageY != undefined) {
	  x = e.pageX;
	  y = e.pageY;
	}
	else {
	  x = e.clientX + document.body.scrollLeft +
	    document.documentElement.scrollLeft;
	  y = e.clientY + document.body.scrollTop +
	    document.documentElement.scrollTop;
	}
	x -= e.target.offsetLeft;
	y -= e.target.offsetTop;
	return {target: e.target,x: x,y: e.clientY.height-y};
};


