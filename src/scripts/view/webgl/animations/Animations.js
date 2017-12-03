import TweenMax from 'gsap';

export default class Animations {

	constructor(webgl) {
		this.webgl = webgl;
		this.center = webgl.center;
		this.camera = webgl.camera;
		this.filmicMaterial = webgl.filmicMaterial;

		this.currAnim = 0;
	}

	start() {
		const num = 1;
		const shuffle = floor(random(num));
		let duration = 5;

		switch (shuffle) {
			case 0: {
				// const x = random() > 0.5 ? 40 : -40;
				const x = random(-40, 40);
				const y = random(-30, 30);
				const z = random(-10, 10) + 50;
				TweenMax.to(this.camera.position, duration, { x, z, z, ease: Quart.easeOut, onUpdate: () => {
					this.camera.lookAt(this.center);
				} });
				/*
				TweenMax.fromTo(this.filmicMaterial, duration, { t: 0 }, { t: 1, ease: Expo.easeOut, onUpdate: () => {
					this.filmicMaterial.uniforms.dispersionOffset.value = this.filmicMaterial.t * 0.1;
					this.filmicMaterial.uniforms.noiseIntensity.value = this.filmicMaterial.t * 0.2;
					this.filmicMaterial.uniforms.scanlineIntensity.value = this.filmicMaterial.t * 0.1;
					this.filmicMaterial.uniforms.distortionScale.value = 1 - this.filmicMaterial.t * 0.2;
					this.filmicMaterial.uniforms.distortionK.value = this.filmicMaterial.t * 0.25;
				} });
				*/
				break;
			}
		}

		this.currAnim = shuffle;
	}

	stop() {
		let duration = 0.5;

		switch (this.currAnim) {
			case 0: {
				TweenMax.to(this.camera.position, duration, { x: 0, y: 0, z: 200, ease: Expo.easeOut, onUpdate: () => {
					this.camera.lookAt(this.center);
				} });
				/*
				TweenMax.to(this.filmicMaterial, duration, { t: 0, ease: Expo.easeOut, onUpdate: () => {
					this.filmicMaterial.uniforms.dispersionOffset.value = this.filmicMaterial.t * 0;
					this.filmicMaterial.uniforms.noiseIntensity.value = this.filmicMaterial.t * 0.04;
					this.filmicMaterial.uniforms.scanlineIntensity.value = this.filmicMaterial.t * 0.01;
					this.filmicMaterial.uniforms.distortionScale.value = 1 - this.filmicMaterial.t * 0.2;
					this.filmicMaterial.uniforms.distortionK.value = this.filmicMaterial.t;
				} });
				*/
				break;
			}
		}
	}
}