import ControlKit from 'controlkit';
import Stats from 'stats.js';

export default class UIView {

	constructor(view) {
		this.view = view;

		this.camOrtho = false;

		const material = this.view.webgl.filmicMaterial;
		this.postEnabled = true;
		this.postBlur = material.defines.BLUR || false;
		this.postDispersion = material.defines.DISPERSION || false;
		this.postDistortion = material.defines.DISTORTION || false;
		this.postnNoise = material.defines.NOISE || false;
		this.postScanlines = material.defines.SCANLINES || false;
		this.postVignette = material.defines.VIGNETTE || false;
		this.postEskil = material.defines.ESKIL || false;

		this.postBlurIntensity = material.uniforms.blurIntensity.value;
		this.postDistortionK = material.uniforms.distortionK.value;
		this.postDistortionKcube = material.uniforms.distortionKcube.value;
		this.postDistortionScale = material.uniforms.distortionScale.value;
		this.postDispersionOffset = material.uniforms.dispersionOffset.value;
		this.postNoiseIntensity = material.uniforms.noiseIntensity.value;
		this.postScanlineIntensity = material.uniforms.scanlineIntensity.value;
		this.postScanlineDensity = material.scanlineDensity;

		this.range = [0, 1];
		this.rangeBlur = [0, 10];
		this.rangeDistortion = [0, 5];

		this.initControlKit();
		// this.initStats();
	}

	initControlKit() {
		const that = this;

		this.controlKit = new ControlKit();
		this.controlKit.addPanel({ width: 300, enable: true })

		.addGroup({label: 'Camera', enable: true })
		// .addSlider(this, 'camOrtho', 'rangeCam', { label: 'x', onChange: () => { that.onCameraChange(); } })
		.addCheckbox(this, 'camOrtho', { label: 'orthographic', onChange: () => { this.onCameraChange(); } })

		.addGroup({label: 'Post Processing', enable: true })
		.addCheckbox(this, 'postEnabled', { label: 'postprocessing', onChange: () => { this.onPostProcessingChange(); } })
		// .addCheckbox(this, 'postBlur', { label: 'blur', onChange: () => { this.onPostProcessingChange(); } })
		.addSlider(this, 'postBlurIntensity', 'rangeBlur', { label: 'blur intensity', onChange: () => { that.onPostProcessingChange(); } })
		// .addCheckbox(this, 'postDispersion', { label: 'dispersion', onChange: () => { this.onPostProcessingChange(); } })
		.addSlider(this, 'postDispersionOffset', 'range', { label: 'dispersion offset', onChange: () => { that.onPostProcessingChange(); } })
		// .addCheckbox(this, 'postDistortion', { label: 'distortion', onChange: () => { this.onPostProcessingChange(); } })
		.addSlider(this, 'postDistortionK', 'range', { label: 'distortion k', onChange: () => { that.onPostProcessingChange(); } })
		.addSlider(this, 'postDistortionKcube', 'range', { label: 'distortion kcube', onChange: () => { that.onPostProcessingChange(); } })
		.addSlider(this, 'postDistortionScale', 'range', { label: 'distortion scale', onChange: () => { that.onPostProcessingChange(); } })
		// .addCheckbox(this, 'postnNoise', { label: 'noise', onChange: () => { this.onPostProcessingChange(); } })
		.addSlider(this, 'postNoiseIntensity', 'range', { label: 'noise intensity', onChange: () => { that.onPostProcessingChange(); } })
		// .addCheckbox(this, 'postScanlines', { label: 'scanlines', onChange: () => { this.onPostProcessingChange(); } })
		.addSlider(this, 'postScanlineDensity', 'range', { label: 'scanline density', onChange: () => { that.onScanlineDensityChange(); } })
		.addSlider(this, 'postScanlineIntensity', 'range', { label: 'scanline intensity', onChange: () => { that.onPostProcessingChange(); } })
		.addCheckbox(this, 'postVignette', { label: 'vignette', onChange: () => { this.onPostProcessingChange(); } })
		.addCheckbox(this, 'postEskil', { label: 'eskil', onChange: () => { this.onPostProcessingChange(); } })
	}

	initStats() {
		this.stats = new Stats();

		document.body.appendChild(this.stats.dom);
	}

	onCameraChange() {
		const webgl = this.view.webgl;
		webgl.camera = (this.camOrtho) ? webgl.orthoCamera : webgl.perspCamera;
		webgl.composer.passes[0].camera = webgl.camera;
	}

	onPostProcessingChange() {
		const material = this.view.webgl.filmicMaterial;

		material.setDefine('BLUR', this.postBlur);
		material.setDefine('DISPERSION', this.postDispersion);
		material.setDefine('DISTORTION', this.postDistortion);
		material.setDefine('NOISE', this.postnNoise);
		material.setDefine('SCANLINES', this.postScanlines);
		material.setDefine('VIGNETTE', this.postVignette);
		material.setDefine('ESKIL', this.postEskil);

		material.uniforms.blurIntensity.value = this.postBlurIntensity;
		material.uniforms.distortionK.value = this.postDistortionK;
		material.uniforms.distortionKcube.value = this.postDistortionKcube;
		material.uniforms.distortionScale.value = this.postDistortionScale;
		material.uniforms.dispersionOffset.value = this.postDispersionOffset;
		material.uniforms.noiseIntensity.value = this.postNoiseIntensity;
		material.uniforms.scanlineIntensity.value = this.postScanlineIntensity;
	}

	onScanlineDensityChange() {
		const material = this.view.webgl.filmicMaterial;

		material.scanlineDensity = this.postScanlineDensity;
		material.resize();
	}
}
