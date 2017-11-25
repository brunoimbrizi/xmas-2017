// @author brunoimbrizi / http://brunoimbrizi.com

uniform sampler2D tDiffuse;
uniform float time;

varying vec2 vUv;

void main() {
	vec4 texel = texture2D(tDiffuse, vUv);

	gl_FragColor = texel;
	// gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}