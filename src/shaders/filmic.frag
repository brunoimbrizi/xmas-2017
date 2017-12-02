/*
A mashup of other shaders:
- Filmic Shader by Matt DesLauriers https://github.com/mattdesl/filmic-gl
- Film Material by Raoul v. R. https://github.com/vanruesc/postprocessing
*/

uniform sampler2D tDiffuse;
uniform float time;

varying vec2 vUv;

#ifdef DISPERSION
	uniform float dispersionOffset;
#endif

#ifdef DISTORTION
	uniform float distortionKcube;
	uniform float distortionK;
	uniform float distortionScale;
#endif

#ifdef NOISE
	uniform float noiseIntensity;
#endif

#ifdef SCANLINES
	uniform float scanlineIntensity;
	uniform float scanlineCount;
#endif

#ifdef VIGNETTE
	uniform float vignetteOffset;
	uniform float vignetteDarkness;
#endif

#ifdef BLUR
	uniform float blurIntensity;

	vec2 rand(vec2 co) {
		float noise1 = (fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453));
		float noise2 = (fract(sin(dot(co, vec2(12.9898, 78.233) * 2.0)) * 43758.5453));
		return clamp(vec2(noise1, noise2), 0.0, 1.0);
	}

	vec3 blur(vec2 coords) { 
		//TODO: the below vignette code can be pulled out of this function and reused
		vec2 noise = rand(vUv.xy);
		float tolerance = 0.2;
		float vignette_size = 0.5;
		vec2 powers = pow(abs(vec2(vUv.s - 0.5, vUv.t - 0.5)), vec2(2.0));
		float radiusSqrd = pow(vignette_size, 2.0);
		float gradient = smoothstep(radiusSqrd - tolerance, radiusSqrd + tolerance, powers.x + powers.y);
		
		vec4 col = vec4(0.0);

		float X1 = coords.x + blurIntensity * noise.x * 0.004 * gradient;
		float Y1 = coords.y + blurIntensity * noise.y * 0.004 * gradient;
		float X2 = coords.x - blurIntensity * noise.x * 0.004 * gradient;
		float Y2 = coords.y - blurIntensity * noise.y * 0.004 * gradient;
		
		float invX1 = coords.x + blurIntensity * ((1.0 - noise.x) * 0.004) * (gradient * 0.5);
		float invY1 = coords.y + blurIntensity * ((1.0 - noise.y) * 0.004) * (gradient * 0.5);
		float invX2 = coords.x - blurIntensity * ((1.0 - noise.x) * 0.004) * (gradient * 0.5);
		float invY2 = coords.y - blurIntensity * ((1.0 - noise.y) * 0.004) * (gradient * 0.5);

		//TODO: optimize the blur --> dependent texture reads and texel centers...
		col += texture2D(tDiffuse, vec2(X1, Y1)) * 0.1;
		col += texture2D(tDiffuse, vec2(X2, Y2)) * 0.1;
		col += texture2D(tDiffuse, vec2(X1, Y2)) * 0.1;
		col += texture2D(tDiffuse, vec2(X2, Y1)) * 0.1;
		
		col += texture2D(tDiffuse, vec2(invX1, invY1)) * 0.15;
		col += texture2D(tDiffuse, vec2(invX2, invY2)) * 0.15;
		col += texture2D(tDiffuse, vec2(invX1, invY2)) * 0.15;
		col += texture2D(tDiffuse, vec2(invX2, invY1)) * 0.15;
		
		return col.rgb;
	}
#endif

void main() {

	vec4 texel = texture2D(tDiffuse, vUv);
	vec3 color = texel.rgb;

	vec3 eta = vec3(1.0, 1.0, 1.0);
	float f = 1.0;
	float scale = 1.0;

	#ifdef DISPERSION
		//index of refraction of each color channel, causing chromatic dispersion
		eta = vec3(1.0 + dispersionOffset * 0.9, 1.0 + dispersionOffset * 0.6, 1.0 + dispersionOffset * 0.3);
		// eta = vec3(1.0 + dispersionOffset * 0.9, 1.0, 1.0);
	#endif

	#ifdef DISTORTION
		float r2 = (vUv.x - 0.5) * (vUv.x - 0.5) + (vUv.y - 0.5) * (vUv.y - 0.5);       

		// f = 1.0 + r2 * distortionK;
		f = 1.0 + r2 * (distortionK + distortionKcube * sqrt(r2));

		scale = distortionScale;
	#endif

	// get the right pixel for the current position
	vec2 rCoords = (f * eta.r) * scale * (vUv.xy - 0.5) + 0.5;
	vec2 gCoords = (f * eta.g) * scale * (vUv.xy - 0.5) + 0.5;
	vec2 bCoords = (f * eta.b) * scale * (vUv.xy - 0.5) + 0.5;

	#ifdef DISTORTION
		color.r = texture2D(tDiffuse, rCoords).r;
		color.g = texture2D(tDiffuse, gCoords).g;
		color.b = texture2D(tDiffuse, bCoords).b;
	#endif

	#ifdef BLUR
		color.r = blur(rCoords).r;
		color.g = blur(gCoords).g;
		color.b = blur(bCoords).b;
	#endif

	texel.rgb = color.rgb;

	#ifdef SCREEN_MODE
		vec3 invColor;
	#endif

	#ifdef NOISE
		float x = vUv.x * vUv.y * time * 1000.0;
		x = mod(x, 13.0) * mod(x, 123.0);
		x = mod(x, 0.01);

		vec3 noise = texel.rgb * clamp(0.1 + x * 100.0, 0.0, 1.0) * noiseIntensity;

		#ifdef SCREEN_MODE
			invColor = vec3(1.0) - color;
			vec3 invNoise = vec3(1.0) - noise;

			color = vec3(1.0) - invColor * invNoise;
		#else
			color += noise;
		#endif
	#endif

	#ifdef SCANLINES
		vec2 sl = vec2(sin(vUv.y * scanlineCount), cos(vUv.y * scanlineCount));
		vec3 scanlines = texel.rgb * vec3(sl.x, sl.y, sl.x) * scanlineIntensity;

		#ifdef SCREEN_MODE
			invColor = vec3(1.0) - color;
			vec3 invScanlines = vec3(1.0) - scanlines;

			color = vec3(1.0) - invColor * invScanlines;
		#else
			color += scanlines;
		#endif
	#endif

	#ifdef VIGNETTE
		const vec2 center = vec2(0.5);

		#ifdef ESKIL
			vec2 uv = (vUv - center) * vec2(vignetteOffset);
			color = mix(color.rgb, vec3(1.0 - vignetteDarkness), dot(uv, uv));
		#else
			float dist = distance(vUv, center);
			color *= smoothstep(0.8, vignetteOffset * 0.799, dist * (vignetteDarkness + vignetteOffset));
		#endif		
	#endif

	gl_FragColor = vec4(clamp(color, 0.0, 1.0), texel.a);

}