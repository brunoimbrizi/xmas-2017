uniform vec3 color;

varying float vIntensity;

void main() {
	vec3 glow = color * vIntensity;
	
	gl_FragColor = vec4( glow, 1.0 );
}