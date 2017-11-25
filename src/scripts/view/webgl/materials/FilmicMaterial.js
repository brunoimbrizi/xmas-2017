const glslify = require('glslify');
import { ShaderMaterial, Uniform, Vector2 } from 'three';

// import fragment from '../../../../shaders/filmic.frag';
// import vertex from '../../../../shaders/default.vert';

export default class FilmicMaterial extends ShaderMaterial {

	constructor(options = {}) {
		const settings = Object.assign({

			screenMode: true,
			noise: true,
			scanlines: true,

			greyscale: false,
			sepia: false,
			vignette: false,
			eskil: false,

			noiseIntensity: 0.5,
			scanlineIntensity: 0.05,
			greyscaleIntensity: 1.0,
			sepiaIntensity: 1.0,

			vignetteOffset: 1.0,
			vignetteDarkness: 1.0

		}, options);

		super({

			type: 'FilmicMaterial',

			uniforms: {

				/*
				tDiffuse: new Uniform(null),
				time: new Uniform(0.0),

				noiseIntensity: new Uniform(settings.noiseIntensity),
				scanlineIntensity: new Uniform(settings.scanlineIntensity),
				scanlineCount: new Uniform(0.0),

				greyscaleIntensity: new Uniform(settings.greyscaleIntensity),
				sepiaIntensity: new Uniform(settings.sepiaIntensity),

				vignetteOffset: new Uniform(settings.vignetteOffset),
				vignetteDarkness: new Uniform(settings.vignetteDarkness)
				*/

				//lens distortion
				resolution: {type: 'v2', value: new Vector2(window.innerWidth, window.innerHeight)},
				k: {type: 'f', value: 0.05},
				kcube: { type: 'f', value: 0.1},
				scale: { type: 'f', value: 0.9},
				dispersion: {type:'f', value:0.01},
				blurAmount: {type: 'f', value: 4.0},
				blurEnabled: {type:'i', value: 1},

				//film grain..
				grainamount: {type: 'f', value: 0.03},
				colored: {type: 'i', value: 0},
				coloramount: {type: 'f', value:0.6},
				grainsize: {type:'f', value:1.9},
				lumamount: {type: 'f', value:1.0},
				timer: {type: 'f', value: 0.0},

				//film dust, scratches, burn
				scratches: {type: 'f', value: 0.0},
				burn: {type: 'f', value: 0.3},

				//filter
				filterStrength: {type: 'f', value: 1},

				//the scene texture...
				// texture: {type:'t', value: renderTarget2},
				texture: new Uniform(null),

				//the filter lookup texture
				// lookupTexture: {type: 't', value: lookupTexture },

			},

			fragmentShader: glslify('../../../../shaders/lens.frag'),
			vertexShader: glslify('../../../../shaders/default.vert'),

			// fragmentShader: fragment,
			// vertexShader: vertex,

			depthWrite: false,
			depthTest: false,

		});
	}
}