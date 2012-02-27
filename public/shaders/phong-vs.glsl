attribute vec3 position;
attribute vec3 normal;

uniform mat4 MVMatrix;
uniform mat4 PMatrix;
uniform mat3 NMatrix;


varying vec3 transformedNormal;

void main(void) {
  transformedNormal = NMatrix * normal;
  gl_Position = PMatrix * MVMatrix * vec4(position, 1.0);
}

