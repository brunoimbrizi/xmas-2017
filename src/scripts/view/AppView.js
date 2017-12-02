import * as THREE from 'three';
import Sketch from 'sketch-js';

import WebGLView from './webgl/WebGLView';
import UIView from './ui/UIView';

export default class AppView {

	constructor() {
		this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });

		this.initSketch();
	}

	initSketch() {
		this.sketch = Sketch.create({
			type: Sketch.WEBGL,
			element: this.renderer.domElement,
			context: this.renderer.context,
			autopause: false,
			retina: (window.devicePixelRatio >= 2),
			fullscreen: true
		});

		this.sketch.setup = () => {
			this.initWebGL();
			this.initUI();
		};

		this.sketch.update = () => {
			// this.ui.stats.begin();
			this.webgl.update();
		};

		this.sketch.draw = () => {
			this.webgl.draw();
			// this.ui.stats.end();
		};

		this.sketch.resize = () => {
			this.webgl.resize();
		};

		this.sketch.touchstart = () => {
			if (!this.webgl) return;

			const touch = this.sketch.touches[0];
			this.webgl.touchstart(touch);
		};

		this.sketch.touchmove = () => {
			if (!this.webgl) return;

			const touch = this.sketch.touches[0];
			this.webgl.touchmove(touch);
		};

		this.sketch.touchend = () => {
			if (!this.webgl) return;

			this.webgl.touchend();
		};

		this.sketch.keyup = (e) => {
			if (!this.webgl) return; 

			// console.log(e.keyCode);
			if (e.keyCode == 82) { // r
				this.webgl.controls.reset();
			}
			if (e.keyCode == 49) { // 1
				// this.webgl.camera.rotation.set(0, Math.PI, 0);
				this.webgl.camera.position.set(300, 0, 0);
				this.webgl.camera.up.set(0, 1, 0);
				this.webgl.camera.lookAt(new THREE.Vector3());
				this.webgl.camera.updateProjectionMatrix();
			}
		};
	}

	initWebGL() {
		// move canvas to container
		document.querySelector('#container').appendChild(this.renderer.domElement);
		
		this.webgl = new WebGLView(this);
	}

	initUI() {
		this.ui = new UIView(this);
	}
}
