uniform float c;
uniform float p;

varying float vIntensity;

void main() {
	vec3 n = normalize(normalMatrix * normal);
	vec3 m = normalize(cameraPosition);
	// vec3 m = normalize(normalMatrix * cameraPosition);

	vIntensity = pow(c - dot(n, m), p);
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
