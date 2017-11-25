import { Pass } from 'postprocessing';

import FilmicMaterial from './../materials/FilmicMaterial';

export default class FilmicPass extends Pass {

	constructor() {

		super();

		this.name = 'FilmicPass';
		this.needsSwap = true;
		this.material = new FilmicMaterial();
		this.quad.material = this.material;

	}

	render(renderer, readBuffer, writeBuffer, delta) {

		this.material.uniforms.texture.value = readBuffer.texture;
		this.material.uniforms.timer.value += delta;

		renderer.render(this.scene, this.camera, this.renderToScreen ? null : writeBuffer);

	}

}