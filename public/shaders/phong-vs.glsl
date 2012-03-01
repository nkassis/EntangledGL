attribute vec3 position;
attribute vec3 normal;


uniform mat4 MVMatrix;
uniform mat4 PMatrix;
uniform mat3 NMatrix;

varying vec3 transformedNormal;
varying vec4 mvPosition;


void main(void) {
  mvPosition = MVMatrix * vec4(position, 1.0);
  gl_Position = PMatrix * mvPosition;
  transformedNormal = NMatrix * normal;
}
