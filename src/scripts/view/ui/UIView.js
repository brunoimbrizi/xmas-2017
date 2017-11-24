import ControlKit from 'controlkit';
import Stats from 'stats.js';

export default class UIView {

	constructor(view) {
		this.view = view;

		this.camOrtho = false;

		this.range = [0, 1];

		this.initControlKit();
		// this.initStats();
	}

	initControlKit() {
		const that = this;

		this.controlKit = new ControlKit();
		this.controlKit.addPanel({ width: 300, enable: false })

		.addGroup({label: 'Camera', enable: true })
		// .addSlider(this, 'camOrtho', 'rangeCam', { label: 'x', onChange: () => { that.onCameraChange(); } })
		.addCheckbox(this, 'camOrtho', { label: 'orthographic', onChange: () => { this.onCameraChange(); } })
	}

	initStats() {
		this.stats = new Stats();

		document.body.appendChild(this.stats.dom);
	}

	onCameraChange() {
		const webgl = this.view.webgl;
		webgl.camera = (this.camOrtho) ? webgl.orthoCamera : webgl.perspCamera;
	}
}
