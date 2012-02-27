precision mediump float;

uniform vec3 ambientColor;
uniform vec3 lightingDirection;
uniform vec3 directionalColor;

varying vec3 transformedNormal;

void main(void) {

  float directionalLightWeighting = max(dot(transformedNormal, lightingDirection), 0.0);
  vec3 lightWeighting = ambientColor + directionalColor * directionalLightWeighting;
  gl_FragColor = vec4(lightWeighting, 1.0);

}
