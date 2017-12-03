const glslify = require('glslify');

import { ShaderMaterial, Uniform, Vector2 } from 'three';

export default class FilmicMaterial extends ShaderMaterial {

	constructor(options = {}) {
		const settings = Object.assign({
			blur: true,
			dispersion: true,
			distortion: true,
			noise: true,
			scanlines: true,
			screenMode: true,
			vignette: true,
			eskil: false,

			distortionK: 0.0,
			distortionKcube: 0.0,
			distortionScale: 1.0,

			dispersionOffset: 0.0,

			blurIntensity: 5,

			noiseIntensity: 0.1,

			scanlineIntensity: 0.04,

			vignetteOffset: 0.0,
			vignetteDarkness: 0.5,

		}, options);

		super({
			type: 'FilmicMaterial',

			uniforms: {
				tDiffuse: new Uniform(null),
				time: new Uniform(0.0),

				noiseIntensity: new Uniform(settings.noiseIntensity),
				scanlineIntensity: new Uniform(settings.scanlineIntensity),
				scanlineCount: new Uniform(0.0),

				vignetteOffset: new Uniform(settings.vignetteOffset),
				vignetteDarkness: new Uniform(settings.vignetteDarkness),

				blurIntensity: new Uniform(settings.blurIntensity),

				dispersionOffset: new Uniform(settings.dispersionOffset),

				distortionK: new Uniform(settings.distortionK),
				distortionKcube: new Uniform(settings.distortionKcube),
				distortionScale: new Uniform(settings.distortionScale),
			},

			fragmentShader: glslify('../../../../shaders/filmic.frag'),
			vertexShader: glslify('../../../../shaders/default.vert'),

			depthWrite: false,
			depthTest: false,

		});

		this.scanlineDensity = (settings.scanlineDensity === undefined) ? 1.0 : settings.scanlineDensity;

		this.setDefine('BLUR', settings.blur);
		this.setDefine('DISPERSION', settings.dispersion);
		this.setDefine('DISTORTION', settings.distortion);
		this.setDefine('NOISE', settings.noise);
		this.setDefine('SCANLINES', settings.scanlines);
		this.setDefine('VIGNETTE', settings.vignette);
		this.setDefine('ESKIL', settings.eskil);
	}

	setDefine(label, enabled) {
		if (enabled) this.defines[label] = '1';
		else delete this.defines[label];
		this.needsUpdate = true;
	}

	// ---------------------------------------------------------------------------------------------
	// PUBLIC
	// ---------------------------------------------------------------------------------------------

	update(delta) {
		this.uniforms.time.value += delta;
	}

	// ---------------------------------------------------------------------------------------------
	// EVENT HANDLERS
	// ---------------------------------------------------------------------------------------------

	resize() {
		this.uniforms.scanlineCount.value = Math.round(window.innerHeight * this.scanlineDensity);
	}

}
