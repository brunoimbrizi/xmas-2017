import { Pass } from 'postprocessing';

import FilmicMaterial from './../materials/FilmicMaterial';

export default class FilmicPass extends Pass {

	constructor(options) {

		super();

		this.name = 'FilmicPass';
		this.needsSwap = true;
		this.material = new FilmicMaterial(options);
		this.quad.material = this.material;

		this.scanlineDensity = (options.scanlineDensity === undefined) ? 1.25 : options.scanlineDensity;
	}

	render(renderer, readBuffer, writeBuffer, delta) {

		this.material.uniforms.tDiffuse.value = readBuffer.texture;
		this.material.uniforms.time.value += delta;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

	setSize(width, height) {

		this.material.uniforms.scanlineCount.value = Math.round(height * this.scanlineDensity);

	}

}