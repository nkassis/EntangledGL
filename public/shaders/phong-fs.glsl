#ifdef GL_ES
precision highp float;
#endif

uniform vec4 ambientColor;
uniform vec4 diffuseColor;
uniform vec3 pointLightLocation;
uniform vec4 specularColor;

varying vec3 transformedNormal;
varying vec4 mvPosition;

void main(void) {
  float materialShininess = 30.0;
  vec4 lightWeighting;
  
  vec3 lightDirection = normalize(pointLightLocation - mvPosition.xyz);
  vec3 normal = normalize(transformedNormal);
  
  float specularLightWeighting = 0.0;

  vec3 eyeDirection = normalize(-mvPosition.xyz);
  vec3 reflectionDirection = reflect(-lightDirection, normal);
  
  specularLightWeighting = pow(max(dot(reflectionDirection, eyeDirection), 0.0), materialShininess);
  
  
  float diffuseLightWeighting = max(dot(normal, lightDirection), 0.0);
  lightWeighting = ambientColor
    + specularColor * specularLightWeighting
    + diffuseColor  * diffuseLightWeighting;
  

  //vec4 fragmentColor;
    
  //fragmentColor = diffuseColor;
  gl_FragColor = lightWeighting;

}
